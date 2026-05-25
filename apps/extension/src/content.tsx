import { createRoot } from "react-dom/client";
import type { AnalysisRequest, AnalysisResponse } from "@verisight/shared-types";
import { ContextCard } from "./components/ContextCard";
import { extractPageContext } from "./utils/extractor";

const API_URL = "https://verisight-backend.frayquaza.workers.dev/analyze";
const HOST_ID = "verisight-root";

function waitForDomReady(): Promise<void> {
  if (document.readyState !== "loading") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    document.addEventListener("DOMContentLoaded", () => resolve(), { once: true });
  });
}

async function requestAnalysis(data: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`VeriSight analysis failed with status ${response.status}`);
  }

  return response.json() as Promise<AnalysisResponse>;
}

function createShadowMount(): ShadowRoot {
  document.getElementById(HOST_ID)?.remove();

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.display = "block";
  host.style.margin = "0";
  host.style.maxWidth = "100%";

  const headline = document.querySelector("h1");

  if (headline?.parentElement) {
    headline.insertAdjacentElement("afterend", host);
  } else if (document.body) {
    document.body.prepend(host);
  } else {
    document.documentElement.append(host);
  }

  return host.attachShadow({ mode: "open" });
}

async function bootstrap(): Promise<void> {
  await waitForDomReady();

  const data = extractPageContext();
  const shadowRoot = createShadowMount();
  const mount = document.createElement("div");
  const root = createRoot(mount);

  shadowRoot.append(mount);

  root.render(<ContextCard state="loading" />);

  try {
    const analysis = await requestAnalysis(data);
    root.render(<ContextCard state="success" data={analysis} />);
  } catch (error) {
    console.warn("[VeriSight] Analysis request failed.", error);
    root.render(
      <ContextCard
        state="error"
        message="Please check that the backend is running and try again."
      />,
    );
  }
}

void bootstrap().catch((error) => {
  console.warn("[VeriSight] Unable to render analysis card.", error);
});
