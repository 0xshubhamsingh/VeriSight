import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { analyzeContent } from "./services/ai.service";
import { analyzeRequestSchema } from "./validators/analyze.validator";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
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

  const analysis = await analyzeContent(result.data);

  return c.json(analysis);
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  console.error(error);

  return c.json({ error: "Internal server error." }, 500);
});

export default app;
