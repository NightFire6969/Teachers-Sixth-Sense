import { NextResponse } from "next/server";
import { callClaude, extractJson } from "@/lib/anthropic";
import { buildAnalysisPrompt } from "@/lib/prompts";
import { validateLessonInput, validateAnalysisResponse, truncateMaterial } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { subject, grade, topic } = body || {};
  const rawMaterial = (body?.material || "").toString();

  const { valid, errors } = validateLessonInput({ subject, grade, topic, material: rawMaterial });
  if (!valid) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors: errors }, { status: 422 });
  }

  const { text: material, truncated } = truncateMaterial(rawMaterial.trim());

  try {
    const { system, prompt } = buildAnalysisPrompt({ subject, grade, topic, material });
    const raw = await callClaude({ system, prompt, maxTokens: 3000 });
    const json = extractJson(raw);
    const result = validateAnalysisResponse(json);

    return NextResponse.json({
      ...result,
      material_truncated: truncated,
    });
  } catch (err) {
    return NextResponse.json({ error: errorMessageFor(err) }, { status: statusFor(err) });
  }
}

function statusFor(err) {
  if (err?.code === "MISSING_API_KEY") return 503;
  if (err?.name === "APIConnectionTimeoutError") return 504;
  return 502;
}

function errorMessageFor(err) {
  if (err?.code === "MISSING_API_KEY") {
    return "The AI service isn't configured yet. Add ANTHROPIC_API_KEY on the server to enable analysis.";
  }
  if (err?.message === "SCHEMA" || err?.code === "MALFORMED_JSON" || err?.code === "EMPTY_RESPONSE") {
    return "The AI returned an unexpected response. Please try scanning again.";
  }
  if (err?.status === 429) {
    return "The AI service is receiving too many requests right now. Please try again in a moment.";
  }
  if (err?.name === "APIConnectionTimeoutError") {
    return "The analysis timed out. Try again, or shorten the lesson material.";
  }
  return "Something went wrong while analyzing this lesson. Please try again.";
}
