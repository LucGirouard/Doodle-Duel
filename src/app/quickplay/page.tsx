"use client";

import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ROOM_CODE_LENGTH, ROUTES } from "@/lib/constants";
import { isValidRoomCode, sanitizeRoomCode } from "@/lib/room-code";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickplayPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const canJoin = isValidRoomCode(joinCode);
  const handleJoin = () =>
    canJoin && router.push(ROUTES.quickplayJoin(joinCode));

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <Link
          href={ROUTES.home}
          className="mb-5 inline-flex items-center text-sm font-semibold text-stone-600 underline decoration-stone-500/60 underline-offset-4 transition hover:text-stone-800"
        >
          Back home
        </Link>
        <div className="animate-[rise-in_700ms_ease-out] flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
              1v1
            </p>
            <PageTitle className="text-4xl sm:text-5xl md:text-6xl">
              Choose a game
            </PageTitle>
            <p className="text-base leading-7 text-stone-700">
              Start a new room or join with a 4-letter code.
            </p>
          </div>

          <div className="grid flex-1 gap-5 lg:max-w-xl">
            <Link
              href={ROUTES.quickplayCreate}
              className="rounded-[1.75rem] border border-amber-800 bg-amber-800 px-6 py-5 text-left text-amber-50 shadow-[0_10px_22px_rgba(95,50,10,0.2)] transition duration-200 hover:bg-amber-700"
            >
              <p className="text-lg font-bold">Create game</p>
              <p className="mt-2 text-sm leading-6 text-amber-100">
                Make a new room and share the code with another player.
              </p>
            </Link>

            <div className="rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white/85 to-[#fff7ed]/65 px-6 py-5 shadow-[0_8px_24px_rgba(80,40,10,0.08)] backdrop-blur-sm">
              <p className="text-lg font-bold text-stone-900">Join game</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Enter the 4-letter code from your opponent.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="flex-1">
                  <span className="sr-only">4-letter game code</span>
                  <input
                    value={joinCode}
                    onChange={(event) =>
                      setJoinCode(sanitizeRoomCode(event.target.value))
                    }
                    placeholder="ABCD"
                    inputMode="text"
                    maxLength={ROOM_CODE_LENGTH}
                    className="w-full rounded-full border border-stone-300/80 bg-[#fffaf1] px-5 py-3 text-center text-lg font-bold tracking-[0.4em] text-stone-900 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
                  />
                </label>

                <PrimaryButton
                  type="button"
                  onClick={handleJoin}
                  disabled={!canJoin}
                  className="px-6 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Join game
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </PageCard>
    </PageShell>
  );
}
