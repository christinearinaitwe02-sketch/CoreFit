import { Router } from "express";

const router = Router();

const OPENAI_BASE_URL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
const OPENAI_API_KEY = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

function extractJson(raw: string): string {
  const stripped = raw.trim();
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) return fenceMatch[1].trim();
  const objMatch = stripped.match(/\{[\s\S]*\}/);
  if (objMatch) return objMatch[0];
  return stripped;
}

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

  const userInput = category ? `${mealName} (${category})` : mealName;

  const prompt = `Estimate the calories for the following meal.
If portion is unclear, assume a standard serving.
Return ONLY valid JSON with these exact fields:
{
  "food_name": "<string>",
  "calories": <number>,
  "confidence": "low" | "medium" | "high",
  "notes": "<brief one-line note>"
}

Meal: ${userInput}`;

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_completion_tokens: 150,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert. Always respond with valid JSON only. No markdown, no explanation — just the JSON object.",
          },
          {
            role: "user",
            content: prompt,
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

    const raw = data.choices[0]?.message?.content ?? "{}";

    let parsed: {
      food_name?: string;
      calories?: number;
      confidence?: string;
      notes?: string;
    } = {};

    try {
      parsed = JSON.parse(extractJson(raw));
    } catch (parseErr) {
      req.log.error({ raw, parseErr }, "Failed to parse AI JSON response");
      res.status(502).json({ error: "AI returned an unexpected response format" });
      return;
    }

    const calories = typeof parsed.calories === "number" ? Math.round(parsed.calories) : 0;
    const foodName = parsed.food_name ?? mealName;
    const confidence = (["low", "medium", "high"].includes(parsed.confidence ?? "")
      ? parsed.confidence
      : "medium") as "low" | "medium" | "high";
    const notes = parsed.notes ?? "";

    res.json({ foodName, calories, confidence, notes });
  } catch (err) {
    req.log.error({ err }, "Failed to estimate calories");
    res.status(500).json({ error: "Failed to estimate calories" });
  }
});

export default router;
