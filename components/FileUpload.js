"use client";

import { useRef, useState } from "react";

export default function FileUpload({ onExtracted }) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | reading | error
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    setStatus("reading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Couldn't read this file.");
        return;
      }

      setStatus("idle");
      onExtracted(data.text, data.warning);
    } catch {
      setStatus("error");
      setError("Couldn't reach the server to read this file. Check your connection and try again.");
    }
  }

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ink-200 bg-white/50 px-4 py-6 text-center transition-colors hover:border-scan"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <p className="text-sm text-ink-500">
          Drop a PDF, TXT, or DOCX file here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-scan underline underline-offset-2"
          >
            browse your files
          </button>
        </p>
        <p className="text-xs text-ink-300">Extracted text lands in the editable field below — nothing is scanned yet.</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {status === "reading" && (
        <p className="mt-2 text-sm text-ink-400">Reading {fileName}&hellip;</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-signal-high" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
