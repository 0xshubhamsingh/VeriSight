import { AutoTokenizer, env as transformersEnv } from "@xenova/transformers";
import { env as onnxEnv, InferenceSession, Tensor as OnnxTensor } from "onnxruntime-web";
import type { AnalysisRequest, AnalysisResponse } from "@verisight/shared-types";

// Configure environments for browser execution
transformersEnv.allowLocalModels = false;
transformersEnv.useBrowserCache = false;

// Force ONNX to use exactly the 1.26.0 WebAssembly core from the CDN to match the workspace JS version
// This stops it from throwing 404s for the dynamically imported jsep.mjs file
onnxEnv.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.26.0/dist/";
onnxEnv.wasm.numThreads = 1;

const TOKENIZER_ID = "bert-base-uncased";
const MAX_SEQUENCE_LENGTH = 256;

// To bypass Cloudflare Workers we run locally in browser
const MODEL_URL = "https://media.githubusercontent.com/media/LordShivam18/AI-Based-Fake-News-Detector/main/apps/frontend/public/model.onnx";

let tokenizerPromise: ReturnType<typeof AutoTokenizer.from_pretrained> | null = null;
let sessionPromise: Promise<InferenceSession> | null = null;
let cachedSession: InferenceSession | null = null;

async function getTokenizer() {
  tokenizerPromise ??= AutoTokenizer.from_pretrained(TOKENIZER_ID);
  return tokenizerPromise;
}

async function getSession(): Promise<InferenceSession> {
  if (cachedSession) return cachedSession;

  // We are in the browser, so standard wasm execution works!
  sessionPromise ??= InferenceSession.create(MODEL_URL, {
    executionProviders: ["wasm"], 
    graphOptimizationLevel: "all"
  });

  cachedSession = await sessionPromise;
  return cachedSession;
}

function softmaxPair(realLogit: number, fakeLogit: number): [number, number] {
  const maxLogit = Math.max(realLogit, fakeLogit);
  const expReal = Math.exp(realLogit - maxLogit);
  const expFake = Math.exp(fakeLogit - maxLogit);
  const sumExp = expReal + expFake;

  return [expReal / sumExp, expFake / sumExp];
}

async function analyzeContent(request: AnalysisRequest): Promise<AnalysisResponse> {
  const tokenizer = await getTokenizer();
  const session = await getSession();

  const textToAnalyze = `${request.headline} ${request.contentSnippets.join(" ")}`;

  const encoded = await tokenizer(textToAnalyze, {
    padding: "max_length",
    truncation: true,
    max_length: MAX_SEQUENCE_LENGTH,
  });

  const extractData = (tensor: any) => {
    const arr = tensor?.data ? Array.from(tensor.data) : Array.from(tensor);
    return arr.map(val => BigInt((val as any) ?? 0));
  };
  
  const inputIdsArray = extractData(encoded.input_ids);
  const attentionMaskArray = extractData(encoded.attention_mask);

  const inputIdsTensor = new OnnxTensor("int64", BigInt64Array.from(inputIdsArray), [1, MAX_SEQUENCE_LENGTH]);
  const attentionMaskTensor = new OnnxTensor("int64", BigInt64Array.from(attentionMaskArray), [1, MAX_SEQUENCE_LENGTH]);

  const feeds = {
    input_ids: inputIdsTensor,
    attention_mask: attentionMaskTensor,
  };

  const results = await session.run(feeds);
  const outputTensor = results[session.outputNames[0]!];
  if (!outputTensor) {
    throw new Error("Output tensor is undefined");
  }
  const logits = outputTensor.data as Float32Array;

  const [fakeLogit = 0, realLogit = 0] = logits;
  const [realProbability, fakeProbability] = softmaxPair(realLogit, fakeLogit);

  const confidence = Math.round(Math.max(realProbability, fakeProbability) * 100);

  let classification: AnalysisResponse["classification"];
  let riskLevel: AnalysisResponse["riskLevel"];

  if (fakeProbability > 0.6) {
    classification = "false";
    riskLevel = "high";
  } else if (fakeProbability > 0.4) {
    classification = "unverifiable";
    riskLevel = "medium";
  } else {
    classification = "verified";
    riskLevel = "low";
  }

  return {
    classification,
    confidence,
    riskLevel,
    summary: [
      `Model analyzed text and found a ${confidence}% probability of being ${classification}.`,
      "This analysis was performed completely securely inside your browser using Verisight AI.",
    ],
  };
}

// Web Worker message handler
self.addEventListener("message", async (event) => {
  const { type, payload, id } = event.data;

  if (type === "analyze") {
    try {
      const result = await analyzeContent(payload as AnalysisRequest);

      self.postMessage({
        type: "result",
        id,
        payload: result,
      });
    } catch (error: any) {
      console.error("Worker error:", error);
      self.postMessage({
        type: "error",
        id,
        payload: error.message || String(error),
      });
    }
  } else if (type === "preload") {
    try {
      await getSession();
      await getTokenizer();
      self.postMessage({ type: "preloaded", id });
    } catch (error: any) {
      self.postMessage({ type: "error", id, payload: error.message || String(error) });
    }
  }
});
