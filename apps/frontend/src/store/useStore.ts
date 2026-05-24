import { create } from "zustand";
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
  overallLiteracyScore: number;
  totalScans: number;
  activeThreatsPrevented: number;
  scans: ScanRecord[];
  exposureTrend: ExposurePoint[];
}

const scans: ScanRecord[] = [
  {
    id: "scan-001",
    date: "2026-05-24T09:42:00.000Z",
    url: "https://example.com/health-study-claim",
    headline: "Viral post claims a common supplement reverses memory loss overnight",
    classification: "misleading",
    confidence: 86,
    riskLevel: "medium",
    summary: ["The claim overstates early-stage research.", "No clinical source supports the overnight result."],
  },
  {
    id: "scan-002",
    date: "2026-05-23T18:10:00.000Z",
    url: "https://example.org/election-count-update",
    headline: "County officials publish verified final vote count after audit",
    classification: "verified",
    confidence: 94,
    riskLevel: "low",
    summary: ["The report matches the county audit release.", "Multiple local outlets cite the same official totals."],
  },
  {
    id: "scan-003",
    date: "2026-05-23T14:28:00.000Z",
    url: "https://example.net/weather-rumor",
    headline: "Secret satellite images prove engineered storm is approaching",
    classification: "false",
    confidence: 91,
    riskLevel: "high",
    summary: ["The images are from a 2019 storm archive.", "Meteorological agencies report no matching event."],
  },
  {
    id: "scan-004",
    date: "2026-05-22T20:15:00.000Z",
    url: "https://news.example.com/transport-policy",
    headline: "New transit policy expands off-peak service in three cities",
    classification: "verified",
    confidence: 89,
    riskLevel: "low",
    summary: ["The article links to the published agency memo.", "Dates and affected routes match public records."],
  },
  {
    id: "scan-005",
    date: "2026-05-22T11:05:00.000Z",
    url: "https://example.com/market-crash-alert",
    headline: "Anonymous banker warns all savings accounts will freeze this week",
    classification: "false",
    confidence: 88,
    riskLevel: "high",
    summary: ["No regulator or bank has issued a matching warning.", "The story relies on an unnamed social post."],
  },
  {
    id: "scan-006",
    date: "2026-05-21T16:36:00.000Z",
    url: "https://example.org/school-lunch-report",
    headline: "District confirms free summer lunch program schedule",
    classification: "verified",
    confidence: 96,
    riskLevel: "low",
    summary: ["The dates match the district calendar.", "The article cites the official family services page."],
  },
  {
    id: "scan-007",
    date: "2026-05-21T08:12:00.000Z",
    url: "https://example.net/celebrity-lawsuit",
    headline: "Leaked court filing says actor admitted to fabricated charity",
    classification: "misleading",
    confidence: 79,
    riskLevel: "medium",
    summary: ["The filing exists but does not contain the quoted admission.", "The headline omits key context from the complaint."],
  },
  {
    id: "scan-008",
    date: "2026-05-20T19:44:00.000Z",
    url: "https://example.com/public-health-alert",
    headline: "City posts verified boil-water notice for two neighborhoods",
    classification: "verified",
    confidence: 92,
    riskLevel: "low",
    summary: ["The notice matches the city emergency bulletin.", "Affected streets are consistent across official channels."],
  },
  {
    id: "scan-009",
    date: "2026-05-19T13:30:00.000Z",
    url: "https://example.org/ai-job-ban",
    headline: "New federal law bans AI tools from every office job",
    classification: "misleading",
    confidence: 83,
    riskLevel: "medium",
    summary: ["The policy applies only to regulated hiring decisions.", "The article broadens the scope beyond the published text."],
  },
  {
    id: "scan-010",
    date: "2026-05-18T07:55:00.000Z",
    url: "https://example.net/breaking-space",
    headline: "Space agency confirms asteroid impact next month",
    classification: "false",
    confidence: 93,
    riskLevel: "high",
    summary: ["The cited object is listed as no-impact by public tracking data.", "The agency page shown in the article is altered."],
  },
];

export const useVeriSightStore = create<VeriSightState>(() => ({
  overallLiteracyScore: 78,
  totalScans: 142,
  activeThreatsPrevented: 24,
  scans,
  exposureTrend: [
    { day: "May 18", scans: 14, threats: 3 },
    { day: "May 19", scans: 18, threats: 4 },
    { day: "May 20", scans: 16, threats: 2 },
    { day: "May 21", scans: 23, threats: 5 },
    { day: "May 22", scans: 21, threats: 4 },
    { day: "May 23", scans: 27, threats: 5 },
    { day: "May 24", scans: 23, threats: 1 },
  ],
}));
