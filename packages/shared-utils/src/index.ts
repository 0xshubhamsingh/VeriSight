export const API_VERSION = "v1" as const;

export function clampConfidence(confidence: number): number {
  if (!Number.isFinite(confidence)) {
    return 0;
  }

  return Math.min(1, Math.max(0, confidence));
}
