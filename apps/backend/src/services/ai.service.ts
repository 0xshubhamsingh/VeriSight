import type {
  AnalysisRequest,
  AnalysisResponse,
} from "@verisight/shared-types";

const MOCK_AI_LATENCY_MS = 800;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// TODO: AI Engineer - Replace this mock with actual Workers AI inference.
export async function analyzeContent(
  data: AnalysisRequest,
): Promise<AnalysisResponse> {
  await wait(MOCK_AI_LATENCY_MS);

  return {
    classification: "misleading",
    confidence: 85,
    riskLevel: "medium",
    summary: [
      `The headline "${data.headline}" contains claims that need stronger source corroboration.`,
      "Available snippets suggest context may be missing or selectively framed.",
    ],
  };
}
