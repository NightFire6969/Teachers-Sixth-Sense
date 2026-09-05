import { NextResponse } from "next/server";
import { getLesson } from "@/lib/lessonStore";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  try {
    const lesson = await getLesson(params.id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }
    return NextResponse.json({ lesson });
  } catch (err) {
    return NextResponse.json({ error: "Could not load this lesson." }, { status: 500 });
  }
}
