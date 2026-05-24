# VeriSight Hackathon Demo Script

## Pre-Demo Checklist

1. Start the backend:
   ```bash
   pnpm --filter @verisight/backend dev
   ```
   Confirm Wrangler is serving the Worker at `http://localhost:8787`.

2. Build and load the Chrome extension:
   ```bash
   pnpm --filter @verisight/extension build
   ```
   Open `chrome://extensions`, enable Developer Mode, choose **Load unpacked**, and select `apps/extension/dist`.

3. Start the dashboard:
   ```bash
   pnpm --filter @verisight/frontend dev
   ```
   Open the Vite URL, usually `http://localhost:5173`.

4. Keep one sample news article open in Chrome before the judges arrive.

## Step 1: The Hook

1. Open the sample article tab.
2. Point to the page headline.
3. Say: "This is the moment where most misinformation tools fail. People do not want to copy text into a separate checker. VeriSight meets them directly inside the article."

## Step 2: The Extension

1. Refresh the article page.
2. Point out the injected card below the headline.
3. Say: "The extension extracts the URL, headline, and article snippets locally, then sends only that compact context to our Worker API."
4. Let the `VeriSight AI scanning content...` loading state pulse for a moment.
5. When the result resolves, highlight:
   - The risk level badge.
   - The confidence score.
   - The two summary bullets.
6. Say: "For the MVP, the AI response is intentionally mocked. The service boundary is already typed, so our AI engineer can replace the stub with Workers AI inference without changing the extension or dashboard contracts."

## Step 3: The Dashboard

1. Switch to the React dashboard tab.
2. On Dashboard, show:
   - Literacy Score.
   - Total Scans.
   - Threats Prevented.
   - The Media Literacy Gauge.
3. Open Exposure Feed.
4. Say: "This gives users a clean scan ledger of what they encountered, with risk, headline, classification, and confidence."
5. Open Insights.
6. Say: "The trends view turns individual warnings into a habit-building feedback loop: scans over time, high-risk exposure, and progress toward stronger media literacy."

## Step 4: Architecture Brief

1. Say: "VeriSight is split into three hackathon-ready layers."
2. Mention:
   - "Cloudflare Workers gives us an edge API that is fast enough for real-time article checks."
   - "The Chrome extension injects UI through Shadow DOM, so publisher CSS cannot break the warning card."
   - "Shared TypeScript contracts keep the backend, extension, and dashboard aligned."
   - "The AI service is modular and mocked today, ready for the real Workers AI implementation."

## Closing Line

"VeriSight turns fact checking from a separate chore into a real-time verification layer that appears exactly when users need it."
