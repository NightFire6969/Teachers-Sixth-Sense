import { NextResponse } from "next/server";
import { MAX_UPLOAD_BYTES, MAX_MATERIAL_CHARS } from "@/lib/validation";

export const runtime = "nodejs";

const SUPPORTED_EXTENSIONS = ["pdf", "txt", "docx"];

function getExtension(filename = "") {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export async function POST(req) {
  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded file." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
  }

  const extension = getExtension(file.name);
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return NextResponse.json(
      { error: `Unsupported file type ".${extension || "unknown"}". Upload a PDF, TXT, or DOCX file instead.` },
      { status: 415 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "This file is empty." }, { status: 422 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `This file is too large (max ${(MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0)}MB). Try a shorter document.` },
      { status: 413 }
    );
  }

  let buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded file." }, { status: 400 });
  }

  let text = "";
  try {
    if (extension === "txt") {
      text = buffer.toString("utf-8");
    } else if (extension === "pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      text = result.text || "";
    } else if (extension === "docx") {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    }
  } catch (err) {
    return NextResponse.json(
      {
        error:
          extension === "pdf"
            ? "This PDF couldn't be read. It may be corrupted, password-protected, or a scanned image without selectable text."
            : "This document couldn't be read. It may be corrupted or in an unsupported format.",
      },
      { status: 422 }
    );
  }

  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!cleaned) {
    return NextResponse.json(
      {
        error:
          extension === "pdf"
            ? "No readable text was found in this PDF. If it's a scanned document, try pasting the text manually instead."
            : "No readable text was found in this document.",
      },
      { status: 422 }
    );
  }

  const truncated = cleaned.length > MAX_MATERIAL_CHARS;
  const finalText = truncated ? cleaned.slice(0, MAX_MATERIAL_CHARS) : cleaned;

  return NextResponse.json({
    text: finalText,
    truncated,
    warning: truncated
      ? `This document is long, so it was shortened to the first ${MAX_MATERIAL_CHARS.toLocaleString()} characters. Review and trim it further before scanning if needed.`
      : null,
  });
}
