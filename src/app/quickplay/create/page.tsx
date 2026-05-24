import Link from "next/link";

export default function CreateGamePage() {
  return (
    <main className="paper-page">
      <div className="paper-center">
        <section className="paper-shell paper-shell-sm grid gap-6">
          <p className="paper-label">
            create game lobby
          </p>

          <h1
            className="paper-heading text-5xl font-black"
          >
            Waiting for player...
          </h1>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="paper-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                room code
              </p>
              <p className="mt-2 text-4xl font-black tracking-[0.35em] text-stone-900">
                XXXX
              </p>
            </div>

            <div className="paper-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                status
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-900">
                Waiting for opponent to join
              </p>
            </div>
          </div>

          <div className="paper-card-dashed text-sm leading-7 text-stone-600">
            <p className="font-semibold text-stone-900">Rules</p>
            <p className="mt-2">
              You will have 60 seconds to draw a random word.
              When the timer runs out, the game will end and you can see how your opponent did.
            </p>
            <p className="mt-2">
             You will be judged!
            </p>                    
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quickplay/play"
              className="paper-button-primary"
            >
              Start
            </Link>

            <Link
              href="/quickplay"
              className="paper-button-secondary"
            >
              Back
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}