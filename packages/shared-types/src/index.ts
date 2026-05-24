export type Classification =
  | "verified"
  | "misleading"
  | "false"
  | "unverifiable";

export type RiskLevel = "low" | "medium" | "high";

export interface AnalysisResponse {
  classification: Classification;
  confidence: number;
  riskLevel: RiskLevel;
  summary: string[];
}

export interface AnalysisRequest {
  url: string;
  headline: string;
  contentSnippets: string[];
}
