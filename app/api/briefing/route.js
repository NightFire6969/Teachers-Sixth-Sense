import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/anthropic";
import { buildBriefingPrompt } from "@/lib/prompts";
import { validateBriefingResponse } from "@/lib/validation";
import { updateLessonBriefing } from "@/lib/lessonStore";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { subject, grade, topic, misconceptions, lessonId } = body || {};

  if (!subject || !grade || !topic || !Array.isArray(misconceptions) || misconceptions.length === 0) {
    return NextResponse.json({ error: "Missing lesson analysis to build a briefing from." }, { status: 422 });
  }

  try {
    const { system, prompt } = buildBriefingPrompt({ subject, grade, topic, misconceptions });
    const raw = await callClaude({ system, prompt, maxTokens: 1200 });
    const json = extractJson(raw);
    const briefing = validateBriefingResponse(json);

    if (lessonId) {
      try {
        await updateLessonBriefing(lessonId, briefing);
      } catch {
        // Non-fatal: still return the briefing even if persistence fails.
      }
    }

    return NextResponse.json({ briefing });
  } catch (err) {
    return NextResponse.json({ error: errorMessageFor(err) }, { status: statusFor(err) });
  }
}

function statusFor(err) {
  if (err?.code === "MISSING_API_KEY") return 503;
  return 502;
}

function errorMessageFor(err) {
  if (err?.code === "MISSING_API_KEY") {
    return "The AI service isn't configured yet. Add ANTHROPIC_API_KEY on the server to enable this feature.";
  }
  if (err?.message === "SCHEMA" || err?.code === "MALFORMED_JSON" || err?.code === "EMPTY_RESPONSE") {
    return "The AI returned an unexpected response while building the briefing. Please try again.";
  }
  return "Something went wrong while generating the briefing. Please try again.";
}
