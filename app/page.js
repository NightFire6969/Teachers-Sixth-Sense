import Link from "next/link";
import Nav from "@/components/Nav";
import WorkflowSteps from "@/components/WorkflowSteps";

function RadarHero() {
  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80" aria-hidden="true">
      <svg viewBox="0 0 320 320" className="h-full w-full overflow-visible">
        <circle cx="160" cy="160" r="140" stroke="#C3C7D6" strokeWidth="1" fill="none" />
        <circle cx="160" cy="160" r="95" stroke="#C3C7D6" strokeWidth="1" fill="none" />
        <circle cx="160" cy="160" r="50" stroke="#C3C7D6" strokeWidth="1" fill="none" />
        <line x1="160" y1="20" x2="160" y2="300" stroke="#E4E6EC" strokeWidth="1" />
        <line x1="20" y1="160" x2="300" y2="160" stroke="#E4E6EC" strokeWidth="1" />

        <g>
          <path
            d="M160 160 L160 20 A140 140 0 0 1 258.99 61.01 Z"
            fill="#3E7DA6"
            opacity="0.16"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 160 160"
              to="360 160 160"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        <circle cx="212" cy="96" r="5" fill="#B8402F" />
        <circle cx="100" cy="205" r="4" fill="#BD7C1E" />
        <circle cx="225" cy="210" r="3.5" fill="#3E7361" />
        <circle cx="160" cy="160" r="4" fill="#161B2E" />
      </svg>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main>
        <section className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-serif text-4xl leading-[1.1] text-ink-800 sm:text-5xl">
              See the misunderstanding before it happens.
            </h1>
            <p className="mt-5 line-length text-lg text-ink-500">
              An AI-powered teaching assistant that helps educators identify potential
              student misconceptions before a lesson begins.
            </p>
            <p className="mt-4 line-length text-sm text-ink-400">
              Teacher&rsquo;s Sixth Sense uses AI to identify potential conceptual
              misconceptions before a lesson begins, helping teachers prepare better
              questions, explanations, and interventions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/analyze"
                className="rounded-sm bg-ink-800 px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink-700"
              >
                Analyze a Lesson
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-ink-500 hover:text-ink-800">
                View the dashboard
              </Link>
            </div>

            <div className="mt-10">
              <WorkflowSteps current={null} />
            </div>
          </div>

          <RadarHero />
        </section>

        <section className="border-t border-ink-100 bg-white/40">
          <div className="container-page grid gap-10 py-14 sm:grid-cols-3">
            <div>
              <p className="font-serif text-lg text-ink-800">Prepare, not react</p>
              <p className="mt-2 text-sm text-ink-500">
                Run any lesson through analysis before you teach it, so you can plan
                for confusion instead of untangling it mid-class.
              </p>
            </div>
            <div>
              <p className="font-serif text-lg text-ink-800">Grounded in your material</p>
              <p className="mt-2 text-sm text-ink-500">
                Every prediction is tied to the specific lesson content you provide —
                not generic subject trivia.
              </p>
            </div>
            <div>
              <p className="font-serif text-lg text-ink-800">Judgment stays with you</p>
              <p className="mt-2 text-sm text-ink-500">
                Predictions are hedged and explainable. You can challenge any of them
                and see the reasoning behind it.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-100 py-8">
        <div className="container-page text-xs text-ink-300">
          Teacher&rsquo;s Sixth Sense &mdash; a teaching preparation tool, not a chatbot.
        </div>
      </footer>
    </div>
  );
}
