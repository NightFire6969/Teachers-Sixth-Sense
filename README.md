# Teacher's Sixth Sense

> "See the misunderstanding before it happens."

An AI-powered teaching assistant that identifies potential student misconceptions
**before** a lesson is taught, so teachers can prepare better questions,
explanations, and interventions. Built as a hackathon demonstration project
with a clean, modular architecture intended for future development.

## Stack

- **Next.js 14** (App Router) — frontend + server-side API routes
- **Tailwind CSS** — styling
- **Claude (Anthropic API)** — misconception analysis, briefings, challenge/alternative reasoning — called **only from server-side API routes**, never from the browser
- **Supabase (Postgres)** — persistent lesson history, with an automatic in-memory mock-data fallback when Supabase isn't configured
- **pdf-parse / mammoth** — server-side text extraction from PDF / DOCX uploads

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

The app works immediately with **no configuration**: the dashboard and
results pages are pre-populated with mock lesson analyses, and the
Analyze page will show a clear, friendly error ("AI service isn't
configured yet") instead of crashing if `ANTHROPIC_API_KEY` is missing.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI features | Server-only. Never exposed to the browser. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-5`. Override to point at a different model. |
| `NEXT_PUBLIC_SUPABASE_URL` | For persistence | Safe to expose; protected by Row Level Security. |
| `SUPABASE_SERVICE_ROLE_KEY` | For persistence | Server-only. Used by API routes so lesson history works without teacher accounts. |

Without the Supabase variables, lesson history is kept in an in-memory
store (seeded with 3 sample analyses) that resets when the server restarts —
useful for demos, not for production.

### Setting up Supabase (optional but recommended)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` from this repo.
3. Copy your project URL, anon key, and **service role key** into `.env.local`.

The schema intentionally stores **no personal information about students** —
only the subject, grade label, topic, lesson material, and the AI-generated
analysis.

## How it works

```
Choose Topic → Add Lesson → Scan → Discover Misconceptions → Prepare Intervention
```

1. **Analyze a Lesson** (`/analyze`) — enter subject/grade/topic and paste or
   upload lesson material (PDF/TXT/DOCX). Extracted text lands in an editable
   field before anything is sent for analysis.
2. **Scan for Misconceptions** sends the lesson to Claude through
   `/api/analyze`, which returns strict, schema-validated JSON: a list of
   potential misconceptions each tagged `HIGH` / `MEDIUM` / `LOW` risk, with
   an explanation, what to watch for, a suggested intervention, and a
   suggested question.
3. A **60-Second Teacher Briefing** is generated (`/api/briefing`) and the
   full analysis is saved (`/api/lessons`), then the teacher is taken to the
   **Results Page** (`/results/[id]`).
4. On the Results Page, each misconception card supports:
   - **Challenge This Prediction** (`/api/challenge`) — the AI explains its
     reasoning, distinguishing evidence found in the lesson from general
     pedagogical reasoning and stated uncertainty.
   - **Show Alternative Interpretation** (`/api/alternative`) — the AI
     considers whether a different reading of the lesson could produce a
     different misconception, and says plainly when it can't find one.
5. The **Dashboard** (`/dashboard`) lists all past analyses with search,
   subject filtering, and sorting, and summarizes total lessons and
   high/medium-risk counts across them.

## AI safety & reliability design

All prompts (see `lib/prompts.js`) enforce:

- Hedged language only ("students may…", "a possible misconception is…") —
  never stated as certain or observed.
- No fabricated sources, statistics, or classroom data.
- Misconceptions are judgments about **conceptual content**, never about
  student intelligence, character, or ability.
- Honest "insufficient material" handling instead of inventing filler
  misconceptions.
- Every AI response is parsed and schema-validated (`lib/validation.js`)
  before it's ever shown to a teacher; malformed or incomplete responses are
  turned into a clear error with a "Retry Analysis" action, never shown raw.

## Project structure

```
app/
  page.js                  Landing page
  dashboard/page.js         Teacher dashboard
  analyze/page.js           Lesson analysis form (+ upload)
  results/[id]/page.js      Results page (briefing + radar + cards)
  api/
    analyze/route.js        Core misconception analysis (Claude)
    briefing/route.js        60-second briefing generation/regeneration
    challenge/route.js       "Challenge This Prediction"
    alternative/route.js     "Show Alternative Interpretation"
    extract-text/route.js    PDF/TXT/DOCX text extraction
    lessons/route.js         List + create lesson history
    lessons/[id]/route.js    Fetch a single lesson
components/                 Reusable UI (cards, states, nav, upload, etc.)
lib/
  anthropic.js               Server-only Claude client
  prompts.js                 Prompt builders + safety rules
  validation.js               Form + AI-response schema validation
  lessonStore.js              Supabase-or-mock data layer
  supabaseAdmin.js             Server-only Supabase client
supabase/schema.sql           Database schema (no student PII)
```

## Notes for further development

- There's currently no teacher authentication — lesson history is shared/
  anonymous, matching the hackathon scope. Adding auth would mean adding a
  `teacher_id` column and scoping the Supabase RLS policies in
  `supabase/schema.sql` accordingly.
- The mock in-memory store in `lib/lessonStore.js` is a drop-in stand-in for
  Supabase — the same functions (`listLessons`, `getLesson`, `createLesson`,
  `updateLessonBriefing`) are used regardless of which backend is active.
