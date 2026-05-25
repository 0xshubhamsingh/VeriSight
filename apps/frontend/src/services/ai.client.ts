import type { AnalysisRequest, AnalysisResponse } from "@verisight/shared-types";

// Create a singleton Web Worker
let worker: Worker | null = null;
let currentMessageId = 0;

const pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

function getWorker(): Worker {
  if (worker) return worker;

  // Initialize the Web Worker using Vite's worker syntax
  worker = new Worker(new URL("./ai.worker.ts", import.meta.url), {
    type: "module",
  });

  worker.addEventListener("message", (event) => {
    const { type, payload, id } = event.data;
    const promise = pendingRequests.get(id);

    if (!promise) return;

    if (type === "result" || type === "preloaded") {
      promise.resolve(payload);
      pendingRequests.delete(id);
    } else if (type === "error") {
      promise.reject(new Error(payload));
      pendingRequests.delete(id);
    }
  });

  return worker;
}

export function preloadModel(): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = ++currentMessageId;
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage({ type: "preload", id });
  });
}

export function analyzeContentBrowser(request: AnalysisRequest): Promise<AnalysisResponse> {
  return new Promise((resolve, reject) => {
    const id = ++currentMessageId;
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage({ type: "analyze", payload: request, id });
  });
}
