import type { CSSProperties } from "react";
import type { AnalysisResponse, RiskLevel } from "@verisight/shared-types";

type ContextCardProps =
  | { state: "loading"; data?: never; message?: never }
  | { state: "error"; data?: never; message?: string }
  | { state: "success"; data: AnalysisResponse; message?: never };

const riskColors: Record<RiskLevel, { accent: string; glow: string; label: string }> = {
  high: {
    accent: "#ff5c7a",
    glow: "rgba(255, 92, 122, 0.22)",
    label: "High risk",
  },
  medium: {
    accent: "#f7b955",
    glow: "rgba(247, 185, 85, 0.2)",
    label: "Medium risk",
  },
  low: {
    accent: "#45d483",
    glow: "rgba(69, 212, 131, 0.18)",
    label: "Low risk",
  },
};

const fontStack =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const motionCss = `
  @keyframes verisightPulse {
    0%, 100% { opacity: 0.58; transform: translateX(0); }
    50% { opacity: 1; transform: translateX(3px); }
  }

  @keyframes verisightGlow {
    0%, 100% { box-shadow: 0 18px 42px rgba(0,0,0,0.28), 0 0 0 4px rgba(52,211,153,0.12); }
    50% { box-shadow: 0 18px 42px rgba(0,0,0,0.32), 0 0 0 4px rgba(52,211,153,0.28); }
  }

  .verisight-loading-card {
    animation: verisightGlow 1.4s ease-in-out infinite;
  }

  .verisight-skeleton {
    animation: verisightPulse 1.1s ease-in-out infinite;
  }
`;

function formatClassification(classification: string): string {
  return classification.charAt(0).toUpperCase() + classification.slice(1);
}

function formatConfidence(confidence: number): string {
  const normalized = confidence <= 1 ? confidence * 100 : confidence;
  return `${Math.round(normalized)}%`;
}

export function ContextCard(props: ContextCardProps) {
  if (props.state === "loading") {
    const styles = createStyles({
      accent: "#34d399",
      glow: "rgba(52, 211, 153, 0.18)",
    });

    return (
      <aside
        className="verisight-loading-card"
        style={styles.card}
        aria-live="polite"
        aria-label="VeriSight analysis loading"
      >
        <style>{motionCss}</style>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VeriSight Analysis</p>
            <h2 style={styles.title}>VeriSight AI scanning content...</h2>
          </div>
          <div style={styles.badge}>Scanning</div>
        </div>

        <div style={styles.loadingStack}>
          <span className="verisight-skeleton" style={styles.skeletonWide} />
          <span className="verisight-skeleton" style={styles.skeletonMid} />
          <span className="verisight-skeleton" style={styles.skeletonShort} />
        </div>
      </aside>
    );
  }

  if (props.state === "error") {
    const styles = createStyles({
      accent: "#fb7185",
      glow: "rgba(251, 113, 133, 0.18)",
    });

    return (
      <aside style={styles.card} aria-live="polite" aria-label="VeriSight analysis error">
        <style>{motionCss}</style>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>VeriSight Analysis</p>
            <h2 style={styles.title}>Analysis Service Unavailable</h2>
          </div>
          <div style={styles.badge}>Offline</div>
        </div>

        <p style={styles.errorText}>
          {props.message ?? "Please check that the local backend is running and try again."}
        </p>
      </aside>
    );
  }

  const { data } = props;
  const risk = riskColors[data.riskLevel];
  const styles = createStyles(risk);

  return (
    <aside style={styles.card} aria-label="VeriSight analysis">
      <style>{motionCss}</style>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>VeriSight Analysis</p>
          <h2 style={styles.title}>{formatClassification(data.classification)}</h2>
        </div>
        <div style={styles.badge}>{risk.label}</div>
      </div>

      <div style={styles.confidenceRow}>
        <span style={styles.confidenceLabel}>Confidence</span>
        <strong style={styles.confidenceValue}>{formatConfidence(data.confidence)}</strong>
      </div>

      <ul style={styles.summaryList}>
        {data.summary.map((item, index) => (
          <li key={`${index}-${item}`} style={styles.summaryItem}>
            <span style={styles.bullet} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function createStyles(
  risk: { accent: string; glow: string },
): Record<string, CSSProperties> {
  return {
    card: {
      boxSizing: "border-box",
      width: "min(720px, 100%)",
      margin: "18px 0",
      padding: "18px",
      borderRadius: "8px",
      border: `1px solid ${risk.accent}`,
      background:
        "linear-gradient(145deg, rgba(12,15,23,0.98), rgba(23,27,38,0.96))",
      boxShadow: `0 18px 42px rgba(0,0,0,0.28), 0 0 0 4px ${risk.glow}`,
      color: "#f8fafc",
      fontFamily: fontStack,
      lineHeight: 1.45,
    },
    header: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "14px",
      marginBottom: "16px",
    },
    eyebrow: {
      margin: "0 0 4px",
      color: "#aeb7c7",
      fontSize: "12px",
      fontWeight: 700,
      letterSpacing: 0,
      textTransform: "uppercase",
    },
    title: {
      margin: 0,
      color: "#ffffff",
      fontSize: "22px",
      fontWeight: 800,
      letterSpacing: 0,
    },
    badge: {
      flex: "0 0 auto",
      border: `1px solid ${risk.accent}`,
      borderRadius: "999px",
      padding: "6px 10px",
      color: risk.accent,
      background: risk.glow,
      fontSize: "12px",
      fontWeight: 800,
      whiteSpace: "nowrap",
    },
    confidenceRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      marginBottom: "14px",
      padding: "12px 14px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.055)",
    },
    confidenceLabel: {
      color: "#c5cedd",
      fontSize: "14px",
      fontWeight: 650,
    },
    confidenceValue: {
      color: risk.accent,
      fontSize: "20px",
      fontWeight: 850,
    },
    loadingStack: {
      display: "grid",
      gap: "10px",
      marginTop: "16px",
    },
    skeletonWide: {
      display: "block",
      width: "100%",
      height: "12px",
      borderRadius: "999px",
      background: "linear-gradient(90deg, rgba(52,211,153,0.12), rgba(52,211,153,0.34))",
    },
    skeletonMid: {
      display: "block",
      width: "72%",
      height: "12px",
      borderRadius: "999px",
      background: "linear-gradient(90deg, rgba(52,211,153,0.12), rgba(52,211,153,0.3))",
    },
    skeletonShort: {
      display: "block",
      width: "46%",
      height: "12px",
      borderRadius: "999px",
      background: "linear-gradient(90deg, rgba(52,211,153,0.12), rgba(52,211,153,0.26))",
    },
    errorText: {
      margin: 0,
      color: "#fecdd3",
      fontSize: "14px",
      lineHeight: 1.6,
    },
    summaryList: {
      display: "grid",
      gap: "10px",
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
    summaryItem: {
      display: "grid",
      gridTemplateColumns: "10px 1fr",
      alignItems: "start",
      gap: "10px",
      color: "#e6ebf4",
      fontSize: "14px",
    },
    bullet: {
      width: "7px",
      height: "7px",
      marginTop: "7px",
      borderRadius: "999px",
      background: risk.accent,
      boxShadow: `0 0 12px ${risk.glow}`,
    },
  };
}
