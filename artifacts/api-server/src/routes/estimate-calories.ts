import { Router } from "express";

const router = Router();

const OPENAI_BASE_URL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
const OPENAI_API_KEY = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

router.post("/estimate-calories", async (req, res) => {
  const { mealName, category } = req.body as {
    mealName?: string;
    category?: string;
  };

  if (!mealName || typeof mealName !== "string") {
    res.status(400).json({ error: "mealName is required" });
    return;
  }

  if (!OPENAI_BASE_URL || !OPENAI_API_KEY) {
    res.status(503).json({ error: "AI integration not configured" });
    return;
  }

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        max_completion_tokens: 100,
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert. Given a meal name, estimate its calorie count. Respond with ONLY a JSON object: {\"calories\": <number>, \"confidence\": \"low|medium|high\", \"notes\": \"<brief note>\"}. No other text.",
          },
          {
            role: "user",
            content: `Meal: ${mealName}${category ? ` (${category})` : ""}. Estimate calories for a typical single serving.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error({ status: response.status, body: errorText }, "OpenAI API error");
      res.status(502).json({ error: "AI service unavailable" });
      return;
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as {
      calories: number;
      confidence: string;
      notes: string;
    };

    res.json({
      calories: Math.round(parsed.calories ?? 0),
      confidence: parsed.confidence ?? "low",
      notes: parsed.notes ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to estimate calories");
    res.status(500).json({ error: "Failed to estimate calories" });
  }
});

export default router;
