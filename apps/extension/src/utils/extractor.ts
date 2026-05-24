import type { AnalysisRequest } from "@verisight/shared-types";

function cleanText(text: string | null | undefined): string {
  return text?.replace(/\s+/g, " ").trim() ?? "";
}

export function extractPageContext(): AnalysisRequest {
  const headline = cleanText(document.querySelector("h1")?.textContent)
    || cleanText(document.title);

  const contentSnippets = Array.from(document.querySelectorAll("p"))
    .slice(0, 3)
    .map((paragraph) => cleanText(paragraph.textContent))
    .filter((snippet) => snippet.length > 0);

  return {
    url: window.location.href,
    headline,
    contentSnippets,
  };
}
