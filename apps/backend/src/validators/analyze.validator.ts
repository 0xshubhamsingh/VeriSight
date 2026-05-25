import { z } from "zod";
import type { AnalysisRequest } from "@verisight/shared-types";

const FALLBACK_URL = "https://manual.verisight.local/unknown";
const FALLBACK_HEADLINE = "Unknown Headline";
const FALLBACK_SNIPPETS = ["No context available."];

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeUrl(value: unknown): unknown {
  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : FALLBACK_URL;
  }

  return value == null ? FALLBACK_URL : value;
}

function normalizeHeadline(value: unknown): unknown {
  if (typeof value === "string") {
    const cleaned = cleanText(value);
    return cleaned.length > 0 ? cleaned : FALLBACK_HEADLINE;
  }

  return value == null ? FALLBACK_HEADLINE : value;
}

function normalizeContentSnippets(value: unknown): unknown {
  const snippets = Array.isArray(value) ? value : typeof value === "string" ? [value] : null;

  if (!snippets) {
    return value == null ? FALLBACK_SNIPPETS : value;
  }

  const cleaned = snippets
    .filter((snippet): snippet is string => typeof snippet === "string")
    .map(cleanText)
    .filter((snippet) => snippet.length > 0);

  return cleaned.length > 0 ? cleaned : FALLBACK_SNIPPETS;
}

export const analyzeRequestSchema = z
  .object({
    url: z.preprocess(normalizeUrl, z.string().url()),
    headline: z.preprocess(normalizeHeadline, z.string().min(1)),
    contentSnippets: z.preprocess(
      normalizeContentSnippets,
      z.array(z.string().min(1)),
    ),
  })
  .strict() satisfies z.ZodType<AnalysisRequest, z.ZodTypeDef, unknown>;

export type AnalyzeRequestPayload = z.infer<typeof analyzeRequestSchema>;
