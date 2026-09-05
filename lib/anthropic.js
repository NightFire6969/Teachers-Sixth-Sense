import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Claude client. The API key is read from an environment
 * variable and is never sent to, or bundled into, the browser. Every
 * caller of this module lives under app/api/** (Next.js route handlers),
 * which only execute server-side.
 */
let client = null;

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error("AI is not configured on the server.");
    err.code = "MISSING_API_KEY";
    throw err;
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

/**
 * Calls Claude with a system prompt + user prompt and returns the raw
 * text response. Callers are responsible for parsing/validating JSON.
 */
export async function callClaude({ system, prompt, maxTokens = 2000, temperature = 0.4 }) {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: maxTokens,
    temperature,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || !textBlock.text) {
    const err = new Error("AI returned an empty response.");
    err.code = "EMPTY_RESPONSE";
    throw err;
  }
  return textBlock.text;
}

/**
 * Extracts a JSON object/array from a model response, tolerating
 * accidental markdown code fences around the JSON.
 */
export function extractJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fall back to locating the first {...} or [...] block.
    const objMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrMatch = cleaned.match(/\[[\s\S]*\]/);
    const candidate = objMatch ? objMatch[0] : arrMatch ? arrMatch[0] : null;
    if (!candidate) {
      const err = new Error("AI response was not valid JSON.");
      err.code = "MALFORMED_JSON";
      throw err;
    }
    try {
      return JSON.parse(candidate);
    } catch (e2) {
      const err = new Error("AI response was not valid JSON.");
      err.code = "MALFORMED_JSON";
      throw err;
    }
  }
}
