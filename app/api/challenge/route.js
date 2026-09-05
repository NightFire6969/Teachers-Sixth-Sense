import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/anthropic";
import { buildChallengePrompt } from "@/lib/prompts";
import { validateChallengeResponse } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { subject, grade, topic, material, misconception } = body || {};
  if (!subject || !grade || !topic || !material || !misconception) {
    return NextResponse.json({ error: "Missing lesson context for this misconception." }, { status: 422 });
  }

  try {
    const { system, prompt } = buildChallengePrompt({ subject, grade, topic, material, misconception });
    const raw = await callClaude({ system, prompt, maxTokens: 900 });
    const json = extractJson(raw);
    const result = validateChallengeResponse(json);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: errorMessageFor(err) }, { status: err?.code === "MISSING_API_KEY" ? 503 : 502 });
  }
}

function errorMessageFor(err) {
  if (err?.code === "MISSING_API_KEY") {
    return "The AI service isn't configured yet. Add ANTHROPIC_API_KEY on the server to enable this feature.";
  }
  if (err?.message === "SCHEMA" || err?.code === "MALFORMED_JSON" || err?.code === "EMPTY_RESPONSE") {
    return "The AI returned an unexpected response. Please try again.";
  }
  return "Something went wrong while retrieving the AI's reasoning. Please try again.";
}
