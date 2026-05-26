import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AnalysisResponse } from "@verisight/shared-types";

export interface ScanRecord extends AnalysisResponse {
  id: string;
  date: string;
  url: string;
  headline: string;
}

export interface ExposurePoint {
  day: string;
  scans: number;
  threats: number;
}

interface VeriSightState {
  scans: ScanRecord[];
  addScan: (record: Omit<ScanRecord, "id" | "date">) => void;
}

// --- Derived selectors (computed from scans) ---

export function selectTotalScans(state: VeriSightState): number {
  return state.scans.length;
}

export function selectThreatsPrevented(state: VeriSightState): number {
  return state.scans.filter((s) => s.riskLevel === "high").length;
}

/**
 * Literacy score: ratio of verified scans to total scans, scaled 0–100.
 * Returns null when there are no scans yet.
 */
export function selectLiteracyScore(state: VeriSightState): number | null {
  if (state.scans.length === 0) return null;

  const verified = state.scans.filter((s) => s.classification === "verified").length;
  return Math.round((verified / state.scans.length) * 100);
}

/**
 * Build the last-7-days exposure trend from actual scan timestamps.
 * Returns an empty array when there are no scans.
 */
export function computeExposureTrend(scans: ScanRecord[]): ExposurePoint[] {
  if (scans.length === 0) return [];

  const now = new Date();
  const days: ExposurePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const dayscans = scans.filter((s) => s.date.slice(0, 10) === dateStr);

    days.push({
      day: label,
      scans: dayscans.length,
      threats: dayscans.filter((s) => s.riskLevel === "high").length,
    });
  }

  return days;
}

// --- Store ---

let scanCounter = 0;

export const useVeriSightStore = create<VeriSightState>()(
  persist(
    (set) => ({
      scans: [],

      addScan: (record) =>
        set((state) => ({
          scans: [
            {
              ...record,
              id: `scan-${Date.now()}-${++scanCounter}`,
              date: new Date().toISOString(),
            },
            ...state.scans,
          ],
        })),
    }),
    {
      name: "verisight-store",
    },
  ),
);
