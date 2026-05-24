"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import {
  PrimaryButton,
  PrimaryLinkButton,
} from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default function TinderArtPage() {
  const router = useRouter();
  const [todaySubmitted, setTodaySubmitted] = useState(false);
  const [poolSize, setPoolSize] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
  if (!data.session) {
    window.location.href = `/auth?mode=login&next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }
  const uid = data.session.user.id;
  const today = new Date().toISOString().slice(0, 10);

      const { data: artworks } = await supabase
        .from("artworks")
        .select("id, user_id")
        .gte("created_at", `${today}T00:00:00`);

      if (artworks) {
        setPoolSize(artworks.length);
        if (uid) setTodaySubmitted(artworks.some((a) => a.user_id === uid));
      }
    });
  }, []);

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <PrimaryLinkButton
          href={ROUTES.quickplay}
          className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200"
        >
          Back
        </PrimaryLinkButton>
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          leaderboard
        </p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">
          Vote on today&apos;s daily draw entries
        </PageTitle>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          Swipe through artwork from the current daily challenge and help rank
          the leaderboard.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Your status
            </p>
            <p className="mt-2 text-base font-semibold text-stone-900">
              {todaySubmitted
                ? "Submitted today"
                : "No daily draw submitted yet"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Voting pool
            </p>
            <p className="mt-2 text-base font-semibold text-stone-900">
              {poolSize} artwork{poolSize === 1 ? "" : "s"} available
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            onClick={() => router.push(ROUTES.tinderArtArena)}
            className="w-full sm:flex-1"
          >
            Enter voting arena
          </PrimaryButton>
          <PrimaryLinkButton
            href={ROUTES.quickplayCreate}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:flex-1"
          >
            Open Daily Draw
          </PrimaryLinkButton>
        </div>
      </PageCard>
    </PageShell>
  );
}
