export const MAX_MATERIAL_CHARS = 20000; // ~ a long lesson plan; keeps AI requests bounded
export const MIN_MATERIAL_CHARS = 20;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

export const RISK_LEVELS = ["HIGH", "MEDIUM", "LOW"];

export const SUBJECTS = [
  "Math",
  "Science",
  "English / Language Arts",
  "History / Social Studies",
  "Foreign Language",
  "Computer Science",
  "Other",
];

export function validateLessonInput({ subject, grade, topic, material }) {
  const errors = {};

  if (!subject || !String(subject).trim()) errors.subject = "Choose a subject.";
  if (!grade || !String(grade).trim()) errors.grade = "Enter a grade or class.";
  if (!topic || !String(topic).trim()) errors.topic = "Enter the lesson topic.";

  const materialTrimmed = (material || "").trim();
  if (!materialTrimmed) {
    errors.material = "Paste or upload lesson material before scanning.";
  } else if (materialTrimmed.length < MIN_MATERIAL_CHARS) {
    errors.material = "Lesson material is very short — add a bit more so the analysis is meaningful.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function truncateMaterial(material) {
  if (material.length <= MAX_MATERIAL_CHARS) {
    return { text: material, truncated: false };
  }
  return { text: material.slice(0, MAX_MATERIAL_CHARS), truncated: true };
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Validates the AI analysis JSON matches the required schema exactly.
 * Throws a descriptive error (never leaks raw AI text) if invalid.
 */
export function validateAnalysisResponse(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("SCHEMA");
  }
  if (typeof data.sufficient_material !== "boolean") {
    throw new Error("SCHEMA");
  }
  if (!Array.isArray(data.misconceptions)) {
    throw new Error("SCHEMA");
  }

  for (const m of data.misconceptions) {
    if (
      !isNonEmptyString(m.misconception) ||
      !RISK_LEVELS.includes(m.risk_level) ||
      !isNonEmptyString(m.explanation) ||
      !isNonEmptyString(m.what_to_watch_for) ||
      !isNonEmptyString(m.suggested_intervention) ||
      !isNonEmptyString(m.suggested_question)
    ) {
      throw new Error("SCHEMA");
    }
  }

  return {
    sufficient_material: data.sufficient_material,
    limited_reason: typeof data.limited_reason === "string" ? data.limited_reason : null,
    misconceptions: data.misconceptions,
  };
}

export function validateBriefingResponse(data) {
  if (!data || typeof data !== "object") throw new Error("SCHEMA");
  if (
    !Array.isArray(data.before_the_lesson) ||
    !Array.isArray(data.during_the_lesson) ||
    !isNonEmptyString(data.if_students_get_confused) ||
    !Array.isArray(data.quick_check)
  ) {
    throw new Error("SCHEMA");
  }
  return {
    before_the_lesson: data.before_the_lesson.filter(isNonEmptyString),
    during_the_lesson: data.during_the_lesson.filter(isNonEmptyString),
    if_students_get_confused: data.if_students_get_confused,
    quick_check: data.quick_check.filter(isNonEmptyString),
  };
}

export function validateChallengeResponse(data) {
  if (
    !data ||
    !isNonEmptyString(data.evidence_from_lesson) ||
    !isNonEmptyString(data.general_reasoning) ||
    !isNonEmptyString(data.uncertainty)
  ) {
    throw new Error("SCHEMA");
  }
  return data;
}

export function validateAlternativeResponse(data) {
  if (!data || typeof data.has_alternative !== "boolean" || !isNonEmptyString(data.uncertainty_note)) {
    throw new Error("SCHEMA");
  }
  return {
    has_alternative: data.has_alternative,
    alternative_misconception: data.alternative_misconception || null,
    reasoning: data.reasoning || null,
    uncertainty_note: data.uncertainty_note,
  };
}
