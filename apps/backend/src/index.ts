import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { analyzeContent, ModelInferenceError } from "./services/ai.service";
import { analyzeRequestSchema } from "./validators/analyze.validator";

type WorkerBindings = {
  MODEL_URL?: string;
};

const ALLOWED_WEB_ORIGINS = new Set([
  "https://verisight-trust-engine.vercel.app",
]);

function isLocalFrontendOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    return (
      (protocol === "http:" || protocol === "https:") &&
      (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]")
    );
  } catch {
    return false;
  }
}

function resolveAllowedOrigin(origin: string): string | undefined {
  if (
    ALLOWED_WEB_ORIGINS.has(origin) ||
    origin.startsWith("chrome-extension://") ||
    isLocalFrontendOrigin(origin)
  ) {
    return origin;
  }

  return undefined;
}

const app = new Hono<{ Bindings: WorkerBindings }>();

app.use(
  "*",
  cors({
    origin: resolveAllowedOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.post("/analyze", async (c) => {
  const body = await c.req.json().catch(() => {
    throw new HTTPException(400, {
      message: "Request body must be valid JSON.",
    });
  });

  const result = analyzeRequestSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        error: "Invalid analysis request payload.",
        issues: result.error.flatten(),
      },
      400,
    );
  }

  const analysis = await analyzeContent(result.data, c.env);

  return c.json(analysis);
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  if (error instanceof ModelInferenceError) {
    return c.json(
      {
        error: "Model inference failed",
        details: error.message,
      },
      500,
    );
  }

  console.error(error);

  return c.json({ error: "Internal server error." }, 500);
});

export default app;
