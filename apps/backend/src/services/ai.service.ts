import { AutoTokenizer, env as transformersEnv } from "@xenova/transformers";
import type { AnalysisRequest, AnalysisResponse } from "@verisight/shared-types";
import { env as onnxEnv, InferenceSession, Tensor as OnnxTensor } from "onnxruntime-web";
// @ts-ignore
import wasmModule from "../../node_modules/onnxruntime-web/dist/ort-wasm.wasm";

const TOKENIZER_ID = "bert-base-uncased";
const MAX_SEQUENCE_LENGTH = 256;
const TEXT_SNIPPET_LIMIT = 300;
const REAL_CONFIDENCE_THRESHOLD = 0.8;
const DEFAULT_MODEL_URL = "https://media.githubusercontent.com/media/LordShivam18/AI-Based-Fake-News-Detector/main/apps/frontend/public/model.onnx";
const TRANSFORMERS_WASM_BASE_URL = "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/";

type Env = {
  MODEL_URL?: string;
};

type TokenizerEncoding = {
  input_ids: any;
  attention_mask: any;
  token_type_ids?: any;
};

type ModelOutputMap = Record<string, OnnxTensor | undefined>;

type BinaryOutcome = {
  classification: AnalysisResponse["classification"];
  confidence: number;
  riskLevel: AnalysisResponse["riskLevel"];
};

let tokenizerPromise: ReturnType<typeof AutoTokenizer.from_pretrained> | null = null;
let cachedSession: InferenceSession | null = null;
let sessionPromise: Promise<InferenceSession> | null = null;

transformersEnv.allowRemoteModels = true;
transformersEnv.allowLocalModels = false;
transformersEnv.backends.onnx.wasm.numThreads = 1;
transformersEnv.backends.onnx.wasm.simd = false;

onnxEnv.wasm.numThreads = 1;
onnxEnv.wasm.proxy = false;
(onnxEnv.wasm as any).simd = false;

export class ModelInferenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelInferenceError";
  }
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function softmaxPair(logitA: number, logitB: number): [number, number] {
  const maxLogit = Math.max(logitA, logitB);
  const expA = Math.exp(logitA - maxLogit);
  const expB = Math.exp(logitB - maxLogit);
  const total = expA + expB;

  return [expA / total, expB / total];
}

function buildInputText(data: AnalysisRequest): string {
  const snippetText = data.contentSnippets.join(" ").slice(0, TEXT_SNIPPET_LIMIT);
  const combined = `${data.headline} ${snippetText}`.trim();

  return combined.length > 0 ? combined : data.headline.trim();
}

function mapBinaryOutcome(realProbability: number, fakeProbability: number): BinaryOutcome {
  const isRealLean = realProbability >= fakeProbability;
  const confidence = clampConfidence(Math.max(realProbability, fakeProbability) * 100);

  if (isRealLean) {
    return {
      classification: confidence >= REAL_CONFIDENCE_THRESHOLD * 100 ? "verified" : "unverifiable",
      confidence,
      riskLevel: confidence >= REAL_CONFIDENCE_THRESHOLD * 100 ? "low" : "medium",
    };
  }

  return {
    classification: confidence >= REAL_CONFIDENCE_THRESHOLD * 100 ? "false" : "misleading",
    confidence,
    riskLevel: confidence >= REAL_CONFIDENCE_THRESHOLD * 100 ? "high" : "medium",
  };
}

function createSummary(
  classification: AnalysisResponse["classification"],
  confidence: number,
  realProbability: number,
  fakeProbability: number,
): string[] {
  const realPercent = clampConfidence(realProbability * 100);
  const fakePercent = clampConfidence(fakeProbability * 100);

  const firstLine =
    classification === "verified"
      ? `The model classifies this item as verified with ${confidence}% confidence (${realPercent}% real vs ${fakePercent}% fake).`
      : classification === "unverifiable"
        ? `The model leans real but only reaches ${confidence}% confidence (${realPercent}% real vs ${fakePercent}% fake), so the item remains unverifiable.`
        : classification === "false"
          ? `The model classifies this item as false with ${confidence}% confidence (${fakePercent}% fake vs ${realPercent}% real).`
          : `The model leans fake but only reaches ${confidence}% confidence (${fakePercent}% fake vs ${realPercent}% real), so the item is misleading rather than fully conclusive.`;

  const secondLine =
    classification === "verified"
      ? "Headline and snippet signals were processed with a BERT tokenizer at 256 tokens, and the result stays on the credible side of the decision boundary."
      : classification === "unverifiable"
        ? "The headline and first 300 characters of supporting text did not produce a decisive separation, so a human review is still recommended."
        : classification === "false"
          ? "The headline and snippets pushed the model strongly toward fabrication, so the claim should not be trusted without independent corroboration."
          : "The headline and snippets suggest a deceptive framing pattern, but the score is not strong enough to treat the claim as definitively fabricated.";

  return [firstLine, secondLine];
}

function getModelUrl(env: Env): string {
  return env.MODEL_URL?.trim() || DEFAULT_MODEL_URL;
}

async function getTokenizer() {
  tokenizerPromise ??= AutoTokenizer.from_pretrained(TOKENIZER_ID).catch((error: unknown) => {
    tokenizerPromise = null;
    throw error;
  });

  return tokenizerPromise;
}

export async function getSession(env: Env): Promise<InferenceSession> {
  if (cachedSession) {
    return cachedSession;
  }

  if (!onnxEnv.wasm.wasmBinary) {
    onnxEnv.wasm.wasmBinary = wasmModule;
  }

  sessionPromise ??= InferenceSession.create(getModelUrl(env), {
    executionProviders: ["wasm"],
  }).then((session) => {
    cachedSession = session;
    return session;
  }).catch((error: unknown) => {
    cachedSession = null;
    sessionPromise = null;
    throw error;
  });

  return sessionPromise;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getLogitsTensor(outputs: ModelOutputMap): OnnxTensor {
  const namedLogits = outputs.logits;
  if (namedLogits) {
    return namedLogits;
  }

  const firstOutput = Object.values(outputs).find((value): value is OnnxTensor => Boolean(value));
  if (!firstOutput) {
    throw new Error("The ONNX model did not return logits.");
  }

  return firstOutput;
}

function toTensor(values: number[], dims: number[]): OnnxTensor {
  return new OnnxTensor("int64", BigInt64Array.from(values.map((value) => BigInt(value))), dims);
}

function normalizeTokenIds(values: any): number[] {
  let seq = values;
  if (seq && seq.data) {
    seq = Array.from(seq.data);
  }
  const sequence = Array.isArray(seq[0]) ? (seq[0] as number[]) : (seq as number[]);
  return sequence.slice(0, MAX_SEQUENCE_LENGTH);
}

function padSequence(values: number[]): number[] {
  if (values.length >= MAX_SEQUENCE_LENGTH) {
    return values.slice(0, MAX_SEQUENCE_LENGTH);
  }

  return [...values, ...Array.from({ length: MAX_SEQUENCE_LENGTH - values.length }, () => 0)];
}

function normalizeTokenizerEncoding(encoding: TokenizerEncoding): {
  inputIds: number[];
  attentionMask: number[];
  tokenTypeIds: number[];
} {
  return {
    inputIds: padSequence(normalizeTokenIds(encoding.input_ids)),
    attentionMask: padSequence(normalizeTokenIds(encoding.attention_mask)),
    tokenTypeIds: padSequence(normalizeTokenIds(encoding.token_type_ids || [])),
  };
}

export async function analyzeContent(
  data: AnalysisRequest,
  env: Env,
): Promise<AnalysisResponse> {
  try {
    const tokenizer = await getTokenizer();
    const session = await getSession(env);
    const inputText = buildInputText(data);
    const tokenize = tokenizer as unknown as (text: string, options: Record<string, unknown>) => TokenizerEncoding;

    const encoding = tokenize(inputText, {
      padding: "max_length",
      truncation: true,
      max_length: MAX_SEQUENCE_LENGTH,
      return_tensors: false,
    });

    const normalized = normalizeTokenizerEncoding(encoding);

    const feeds: Record<string, OnnxTensor> = {
      input_ids: toTensor(normalized.inputIds, [1, MAX_SEQUENCE_LENGTH]),
      attention_mask: toTensor(normalized.attentionMask, [1, MAX_SEQUENCE_LENGTH]),
    };

    let outputs: ModelOutputMap;
    try {
      if (encoding.token_type_ids) {
        feeds.token_type_ids = toTensor(normalized.tokenTypeIds, [1, MAX_SEQUENCE_LENGTH]);
      }
      outputs = (await session.run(feeds)) as ModelOutputMap;
    } catch (e) {
      // If it fails with token_type_ids, try without it
      if (feeds.token_type_ids) {
        delete feeds.token_type_ids;
        outputs = (await session.run(feeds)) as ModelOutputMap;
      } else {
        throw e;
      }
    }

    const logitsTensor = getLogitsTensor(outputs);
    const logits = Array.from(logitsTensor.data as Float32Array);

    if (logits.length < 2) {
      throw new Error("The ONNX model returned fewer than two logits.");
    }

    const [realLogit = 0, fakeLogit = 0] = logits;
    const [realProbability, fakeProbability] = softmaxPair(realLogit, fakeLogit);
    const mapped = mapBinaryOutcome(realProbability, fakeProbability);

    return {
      classification: mapped.classification,
      confidence: mapped.confidence,
      riskLevel: mapped.riskLevel,
      summary: createSummary(
        mapped.classification,
        mapped.confidence,
        realProbability,
        fakeProbability,
      ),
    };
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("AI Service Error:", error, message);
    throw new ModelInferenceError(message);
  }
}
