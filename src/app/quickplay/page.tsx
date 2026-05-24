"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function sanitizeCode(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);
}

export default function QuickplayPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");

  const canJoin = useMemo(() => /^[A-Z]{4}$/.test(joinCode), [joinCode]);

  function handleJoin() {
    if (!canJoin) {
      return;
    }

    router.push(`/quickplay/join/${joinCode}`);
  }

  return (
    <main className="paper-page">
      <div className="paper-center">
        <section className="paper-shell paper-shell-md">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-md space-y-4">
              <p className="paper-label">
                quickplay
              </p>
              <h1
                className="paper-heading text-5xl font-black sm:text-6xl"
              >
                Choose a game
              </h1>
              <p className="text-base leading-7 text-stone-600">
                Start a new room or join with a 4-letter code.
              </p>
              <Link
                href="/"
                className="paper-link-muted"
              >
                Back home
              </Link>
            </div>

            <div className="grid flex-1 gap-5 lg:max-w-xl">
              <Link
                href="/quickplay/create"
                className="rounded-[1.75rem] border border-stone-900 bg-stone-900 px-6 py-5 text-left text-[#fffaf1] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-stone-800"
              >
                <p className="text-lg font-bold">Create game</p>
                <p className="mt-2 text-sm leading-6 text-stone-200">
                  Make a new room and share the code with another player.
                </p>
              </Link>

              <div className="paper-card px-6 py-5">
                <p className="text-lg font-bold text-stone-900">Join game</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Enter the 4-letter code from your opponent.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <label className="flex-1">
                    <span className="sr-only">4-letter game code</span>
                    <input
                      value={joinCode}
                      onChange={(event) => setJoinCode(sanitizeCode(event.target.value))}
                      placeholder="ABCD"
                      inputMode="text"
                      maxLength={4}
                      className="w-full rounded-full border border-stone-300 bg-[#fffaf1] px-5 py-3 text-center text-lg font-bold tracking-[0.4em] text-stone-900 outline-none transition focus:border-stone-900"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={!canJoin}
                    className="paper-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Join game
                  </button>
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.3em] text-stone-500">
                  4 letters only
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}