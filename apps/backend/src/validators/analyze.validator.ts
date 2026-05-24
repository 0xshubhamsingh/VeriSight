import { z } from "zod";
import type { AnalysisRequest } from "@verisight/shared-types";

export const analyzeRequestSchema = z
  .object({
    url: z.string().url(),
    headline: z.string().min(1),
    contentSnippets: z.array(z.string().min(1)),
  })
  .strict() satisfies z.ZodType<AnalysisRequest>;

export type AnalyzeRequestPayload = z.infer<typeof analyzeRequestSchema>;
