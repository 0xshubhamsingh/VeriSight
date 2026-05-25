import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { AnalysisRequest, AnalysisResponse } from "@verisight/shared-types";
import { RiskBadge } from "./RiskBadge";

const API_URL = "https://verisight-backend.frayquaza.workers.dev/analyze";
const MANUAL_TEXT_URL = "https://manual.verisight.local/scan";
const MAX_HEADLINE_LENGTH = 120;
const MAX_SNIPPET_LENGTH = 1200;

type RequestState = "idle" | "loading" | "success" | "error";

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

function deriveHeadline(value: string): string {
  const firstSentence = value.match(/^[^.!?\n]+[.!?]?/)?.[0] ?? value;
  const cleaned = cleanText(firstSentence);

  return truncate(cleaned || "Manual Scan", MAX_HEADLINE_LENGTH);
}

function buildManualRequest(input: string): AnalysisRequest {
  const cleaned = cleanText(input);

  if (isHttpUrl(cleaned)) {
    const url = new URL(cleaned);

    return {
      url: cleaned,
      headline: `Manual scan for ${url.hostname}`,
      contentSnippets: [`User requested verification for ${cleaned}`],
    };
  }

  return {
    url: MANUAL_TEXT_URL,
    headline: deriveHeadline(cleaned),
    contentSnippets: [truncate(cleaned, MAX_SNIPPET_LENGTH)],
  };
}

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

import { analyzeContentBrowser, preloadModel } from "../services/ai.client";

// Preload the model in the background as soon as the component loads
preloadModel().catch(console.error);

async function requestAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
  // Use the local Web Worker for 100% free, securely isolated, zero-latency inference
  return await analyzeContentBrowser(data);
}

export function ManualScanner() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const summary = useMemo(() => result?.summary.slice(0, 2) ?? [], [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned = cleanText(input);

    if (!cleaned) {
      setError("Enter an article URL or text snippet.");
      setState("error");
      setResult(null);
      return;
    }

    setState("loading");
    setError("");

    try {
      const analysis = await requestAnalysis(buildManualRequest(cleaned));
      setResult(analysis);
      setState("success");
    } catch (requestError) {
      console.warn("[VeriSight] Manual scan failed.", requestError);
      setResult(null);
      setError("Unable to reach the verification service.");
      setState("error");
    }
  }

  return (
    <section className="rounded-xl border border-emerald-500/25 bg-slate-900/75 p-5 shadow-[0_0_18px_rgba(16,185,129,0.14)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-emerald-300">
            Manual Scan
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            Verify content
          </h2>
        </div>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <form className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={handleSubmit}>
        <label className="min-w-0">
          <span className="sr-only">Article URL or text snippet</span>
          <textarea
            className="min-h-36 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="Paste an article URL or claim text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-400 px-5 text-sm font-bold text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.25)] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 lg:self-start"
          disabled={state === "loading"}
        >
          {state === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          )}
          Verify Content
        </button>
      </form>

      {state === "error" && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <article className="mt-5 grid gap-5 rounded-lg border border-slate-800 bg-slate-950/70 p-5 lg:grid-cols-[auto_1fr]">
          <ConfidenceGauge confidence={result.confidence} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300">
                {formatLabel(result.classification)}
              </span>
              <RiskBadge riskLevel={result.riskLevel} />
            </div>

            <ul className="mt-4 grid gap-3">
              {summary.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-sm leading-6 text-slate-300"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </article>
      )}
    </section>
  );
}

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const score = Math.max(0, Math.min(100, Math.round(confidence)));

  return (
    <div className="flex h-32 w-32 flex-none items-center justify-center rounded-full border border-emerald-400/20 bg-slate-900">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#34d399 ${score * 3.6}deg, #1e293b 0deg)`,
        }}
      >
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-slate-950">
          <strong className="text-2xl font-black tracking-normal text-white">
            {score}%
          </strong>
          <span className="text-xs font-semibold text-emerald-300">Confidence</span>
        </div>
      </div>
    </div>
  );
}
