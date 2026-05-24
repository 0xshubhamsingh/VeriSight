# 🚀 VeriSight AI Integration & Handoff Guide

**To the AI Engineer:** The core infrastructure for the VeriSight MVP is fully built, tested, and ready for your trained Workers AI model. 

This document contains everything you need to know to swap out the mock API and wire up your live AI inference.

---

## 🏗️ 1. Architecture Overview
- **Frontend & Extension:** Fully complete. They handle scraping the DOM, injecting the UI warnings via Shadow DOM, and displaying analytics. **You do not need to touch these.**
- **Backend:** Cloudflare Worker running Hono (`apps/backend`). It receives the scraped page data, validates it, and passes it to the AI service.
- **The Monorepo:** We are using `pnpm` workspaces. The only file you need to modify is inside the backend app.

---

## 🤝 2. The Strict Data Contract

The entire frontend UI relies on a strict TypeScript contract. 

### What your model receives:
When the extension scrapes a webpage, it sends this exact JSON payload to the backend:

```typescript
interface AnalysisRequest {
  url: string;
  headline: string;
  contentSnippets: string[]; // Usually the first 3 paragraphs
}

### What your model MUST return:
Your prompt must enforce that the LLM returns a JSON object perfectly matching this structure. The UI components will break if the keys or enums are incorrect.

TypeScript
interface AnalysisResponse {
  classification: "verified" | "misleading" | "false" | "unverifiable";
  confidence: number; // 0 to 100
  riskLevel: "low" | "medium" | "high";
  summary: string[]; // Exactly 2 short bullet points explaining the reasoning
}
🔌 3. Integration Steps
Navigate to: apps/backend/src/services/ai.service.ts

Right now, the analyzeContent() function uses a setTimeout to fake network latency and returns a hardcoded mock JSON object.

Your Tasks:

Delete the setTimeout mock logic.

Bind your trained Workers AI model to the Cloudflare environment (env.AI.run(...)).

Pass the incoming data (headline + snippets) into your model's prompt.

Return the parsed JSON.

⚠️ 4. Critical Rules for the AI Output
Force JSON: Instruct the AI to only output valid JSON.

Strip Markdown: If your model wraps the response in markdown code blocks (e.g., ```json), you must strip those out in ai.service.ts before returning it, or the Hono JSON parser will crash.

Strict Enums: We use Zod for backend validation. If the AI returns a classification of "fake" instead of "false", the API will throw a 400 Error and the extension will show a failure state.

🏁 5. Testing Your Integration locally
Run pnpm install in the root folder.

Go to apps/backend and run pnpm dev to start the Wrangler server on localhost:8787.

Test your AI by sending a POST request to http://localhost:8787/analyze with a sample AnalysisRequest JSON body.

Once it returns the correct AnalysisResponse structure, the Chrome extension and React dashboard will automatically work flawlessly!
