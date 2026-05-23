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
    <main className="relative min-h-screen overflow-hidden bg-[#f4ede3] px-6 py-8 text-stone-900 sm:px-10 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(121, 85, 61, 0.08) 0, rgba(121, 85, 61, 0.08) 1px, transparent 1px, transparent 40px), linear-gradient(to right, transparent 0, transparent 72px, rgba(184, 28, 28, 0.16) 72px, rgba(184, 28, 28, 0.16) 74px, transparent 74px)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.65),transparent_30%)] opacity-80"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center justify-center">
        <section className="w-full rounded-[2.5rem] border border-stone-300/80 bg-[#fffaf1]/95 px-7 py-10 shadow-[0_24px_80px_rgba(80,55,30,0.16)] sm:px-10 sm:py-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-md space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
                quickplay
              </p>
              <h1
                className="text-5xl font-black tracking-tight text-stone-900 sm:text-6xl"
                style={{ fontFamily: '"Chalkboard SE", "Comic Sans MS", cursive' }}
              >
                Choose a game
              </h1>
              <p className="text-base leading-7 text-stone-600">
                Start a new room or join with a 4-letter code.
              </p>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-semibold text-stone-500 underline decoration-stone-400/70 underline-offset-4"
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

              <div className="rounded-[1.75rem] border border-stone-300 bg-white/70 px-6 py-5">
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
                    className="rounded-full border border-stone-900 bg-stone-900 px-6 py-3 text-sm font-semibold text-[#fffaf1] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
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