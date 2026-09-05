import { getSupabaseAdmin, isSupabaseConfigured } from "./supabaseAdmin";

/**
 * Data-access layer for lesson analyses.
 *
 * Uses Supabase when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * are configured. Otherwise falls back to an in-memory store seeded with
 * mock data, so the dashboard and results pages are fully explorable
 * without any setup — matching the brief's "use mock data initially, but
 * connect it to Supabase once database functionality is implemented."
 *
 * The in-memory store resets whenever the server process restarts.
 */

function countByRisk(misconceptions = []) {
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  for (const m of misconceptions) {
    if (counts[m.risk_level] !== undefined) counts[m.risk_level] += 1;
  }
  return counts;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const MOCK_LESSONS = [
  {
    id: "mock-1",
    created_at: daysAgo(1),
    subject: "Math",
    grade: "6th Grade",
    topic: "Fractions & Division",
    material:
      "Dividing fractions: to divide by a fraction, multiply by its reciprocal. Example: 3/4 ÷ 1/2 = 3/4 × 2/1 = 3/2.",
    material_truncated: false,
    misconceptions: [
      {
        misconception:
          "Students may believe dividing always makes a number smaller, so dividing by a fraction less than 1 producing a larger result will seem wrong.",
        risk_level: "HIGH",
        explanation:
          "This is a common carry-over from whole-number division, where the dividend is usually larger than the result. The lesson does not explicitly address this expectation before introducing the reciprocal rule.",
        what_to_watch_for:
          "Students second-guessing a correct answer because 'it got bigger,' or rounding down their result to make it 'feel right.'",
        suggested_intervention:
          "Use a concrete measurement example (how many 1/2-cup scoops fit in 3/4 cup) before introducing the abstract rule.",
        suggested_question:
          "If you have 3/4 of a pizza and each slice is 1/2, how many slices do you get — more or fewer than 3/4?",
      },
      {
        misconception:
          "Students may apply the reciprocal to the wrong fraction (the dividend instead of the divisor).",
        risk_level: "MEDIUM",
        explanation:
          "The lesson presents the rule as 'multiply by the reciprocal' without repeatedly marking which fraction the rule applies to, which may cause students to flip the first fraction instead of the second.",
        what_to_watch_for:
          "Answers that are the reciprocal of the expected result, or students flipping both fractions.",
        suggested_intervention:
          "Have students verbally state 'keep, change, flip' while pointing to each fraction in order before computing.",
        suggested_question:
          "Which fraction did we flip just now, and why that one?",
      },
      {
        misconception:
          "Students may treat the multiplication step as optional once they've flipped the fraction.",
        risk_level: "LOW",
        explanation:
          "This is a possible procedural slip rather than a conceptual gap, and the lesson material does not provide enough detail to judge how likely it is.",
        what_to_watch_for: "Answers that are just the flipped fraction with no multiplication applied.",
        suggested_intervention: "Model one full example step-by-step on the board before independent practice.",
        suggested_question: "What's the next step after we flip the second fraction?",
      },
    ],
    limited_analysis: false,
    limited_reason: null,
    briefing: {
      before_the_lesson: [
        "Students may expect division to always shrink a number, making dividing-by-a-fraction results feel 'wrong.'",
        "Students may flip the wrong fraction when applying 'keep, change, flip.'",
      ],
      during_the_lesson: [
        "Watch for students silently adjusting or rounding down answers that 'feel too big.'",
        "Listen for students describing which fraction they flipped — flag anyone unsure.",
      ],
      if_students_get_confused:
        "Return to a concrete measurement example (cups, pizza slices) before re-introducing the abstract reciprocal rule.",
      quick_check: [
        "Without solving it, is 3/4 ÷ 1/2 bigger or smaller than 3/4? Why?",
      ],
    },
    high_count: 1,
    medium_count: 1,
    low_count: 1,
  },
  {
    id: "mock-2",
    created_at: daysAgo(3),
    subject: "Science",
    grade: "8th Grade",
    topic: "Photosynthesis",
    material:
      "Plants make food through photosynthesis using sunlight, water, and carbon dioxide, producing glucose and oxygen.",
    material_truncated: false,
    misconceptions: [
      {
        misconception:
          "Students may think plants get their food from the soil rather than producing it themselves.",
        risk_level: "HIGH",
        explanation:
          "This is a widely documented misconception because 'feeding' plants with soil and fertilizer is common everyday language, and the lesson material doesn't contrast soil nutrients with food production.",
        what_to_watch_for: "Students describing soil as the plant's 'food source' during discussion.",
        suggested_intervention:
          "Directly contrast 'nutrients from soil' (like vitamins) with 'food/energy' made via photosynthesis (glucose).",
        suggested_question: "If a plant's food comes from the soil, why does it also need sunlight?",
      },
      {
        risk_level: "MEDIUM",
        misconception: "Students may believe photosynthesis and respiration are the same process.",
        explanation:
          "The material introduces the inputs/outputs of photosynthesis without explicitly distinguishing it from cellular respiration, which students often encounter around the same time.",
        what_to_watch_for: "Students mixing up which gas is absorbed vs. released.",
        suggested_intervention: "Use a simple two-column comparison of inputs/outputs for each process.",
        suggested_question: "What gas does a plant take in during photosynthesis, and what does it release?",
      },
    ],
    limited_analysis: false,
    limited_reason: null,
    briefing: {
      before_the_lesson: [
        "Students may think soil is a plant's food, not a nutrient source.",
        "Students may conflate photosynthesis with respiration.",
      ],
      during_the_lesson: [
        "Listen for 'food from the soil' language during group discussion.",
        "Watch for gas inputs/outputs being swapped on worksheets.",
      ],
      if_students_get_confused:
        "Pause and build a two-column board comparison: photosynthesis inputs/outputs vs. respiration inputs/outputs.",
      quick_check: ["Where does a plant's food actually come from, and what raw materials does it need?"],
    },
    high_count: 1,
    medium_count: 1,
    low_count: 0,
  },
  {
    id: "mock-3",
    created_at: daysAgo(6),
    subject: "History",
    grade: "10th Grade",
    topic: "Causes of World War I",
    material:
      "The assassination of Archduke Franz Ferdinand triggered a chain of alliances that led to WWI, but underlying causes included militarism, alliances, imperialism, and nationalism.",
    material_truncated: false,
    misconceptions: [
      {
        misconception:
          "Students may believe the assassination was the sole cause of WWI rather than a triggering event.",
        risk_level: "MEDIUM",
        explanation:
          "The material leads with the assassination before listing underlying causes, which may cause students to weight it as the single cause rather than a spark.",
        what_to_watch_for: "Essay answers that name only the assassination when asked for 'causes' (plural).",
        suggested_intervention:
          "Use a spark-vs-kindling metaphor: the assassination as the spark, MAIN causes as the kindling already in place.",
        suggested_question: "If the assassination hadn't happened, do you think a large war was still likely? Why?",
      },
      {
        misconception: "Students may treat the MAIN acronym causes as equally weighted rather than interacting.",
        risk_level: "LOW",
        explanation:
          "The lesson material lists the causes together without describing how they reinforced one another, but there isn't enough detail here to be confident this will occur.",
        what_to_watch_for: "Students listing causes without connecting them.",
        suggested_intervention: "Have students draw arrows between causes showing how one fed another.",
        suggested_question: "How did the alliance system make nationalism more dangerous?",
      },
    ],
    limited_analysis: false,
    limited_reason: null,
    briefing: {
      before_the_lesson: [
        "Students may treat the assassination as the sole cause rather than the trigger.",
        "Students may list the MAIN causes without seeing how they interacted.",
      ],
      during_the_lesson: [
        "Listen for 'the cause was the assassination' phrasing in discussion.",
        "Watch for cause lists with no connecting reasoning.",
      ],
      if_students_get_confused:
        "Use the spark-vs-kindling metaphor and have students physically map cause interactions.",
      quick_check: ["Was the assassination a cause of WWI, or a trigger for existing causes? What's the difference?"],
    },
    high_count: 0,
    medium_count: 1,
    low_count: 1,
  },
];

let memoryStore = [...MOCK_LESSONS];

function toRow(input) {
  const counts = countByRisk(input.misconceptions);
  return {
    subject: input.subject,
    grade: input.grade,
    topic: input.topic,
    material: input.material,
    material_truncated: Boolean(input.material_truncated),
    misconceptions: input.misconceptions,
    limited_analysis: Boolean(input.limited_analysis),
    limited_reason: input.limited_reason || null,
    briefing: input.briefing || null,
    high_count: counts.HIGH,
    medium_count: counts.MEDIUM,
    low_count: counts.LOW,
  };
}

export async function listLessons({ search, subject, sort } = {}) {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    let query = supabase.from("lessons").select("*");
    if (subject && subject !== "all") query = query.eq("subject", subject);
    if (search) {
      query = query.or(`topic.ilike.%${search}%,subject.ilike.%${search}%`);
    }
    query = query.order("created_at", { ascending: sort === "oldest" });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  let rows = [...memoryStore];
  if (subject && subject !== "all") rows = rows.filter((r) => r.subject === subject);
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(
      (r) => r.topic.toLowerCase().includes(s) || r.subject.toLowerCase().includes(s)
    );
  }
  rows.sort((a, b) =>
    sort === "oldest"
      ? new Date(a.created_at) - new Date(b.created_at)
      : new Date(b.created_at) - new Date(a.created_at)
  );
  return rows;
}

export async function getLesson(id) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("lessons").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  }
  return memoryStore.find((r) => r.id === id) || null;
}

export async function createLesson(input) {
  const supabase = getSupabaseAdmin();
  const row = toRow(input);

  if (supabase) {
    const { data, error } = await supabase.from("lessons").insert(row).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  const record = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    ...row,
  };
  memoryStore = [record, ...memoryStore];
  return record;
}

export async function updateLessonBriefing(id, briefing) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("lessons")
      .update({ briefing })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const idx = memoryStore.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  memoryStore[idx] = { ...memoryStore[idx], briefing };
  return memoryStore[idx];
}

export function usingMockStore() {
  return !isSupabaseConfigured();
}
