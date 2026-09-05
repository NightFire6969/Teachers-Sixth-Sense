import { NextResponse } from "next/server";
import { listLessons, createLesson, usingMockStore } from "@/lib/lessonStore";
import { validateLessonInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const subject = searchParams.get("subject") || "all";
  const sort = searchParams.get("sort") || "newest";

  try {
    const lessons = await listLessons({ search, subject, sort });
    return NextResponse.json({ lessons, mock: usingMockStore() });
  } catch (err) {
    return NextResponse.json({ error: "Could not load lesson history." }, { status: 500 });
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { subject, grade, topic, material } = body || {};
  const { valid, errors } = validateLessonInput({ subject, grade, topic, material });
  if (!valid) {
    return NextResponse.json({ error: "Missing required lesson fields.", fieldErrors: errors }, { status: 422 });
  }
  if (!Array.isArray(body.misconceptions)) {
    return NextResponse.json({ error: "Missing analysis results to save." }, { status: 422 });
  }

  try {
    const record = await createLesson(body);
    return NextResponse.json({ lesson: record }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Could not save this analysis." }, { status: 500 });
  }
}
