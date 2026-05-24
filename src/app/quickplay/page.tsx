"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryLinkButton } from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

export default function QuickplayPage() {
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  useEffect(() => {
  supabase.auth.getSession().then(async ({ data }) => {
    if (!data.session) {
      window.location.href = `/auth?mode=login&next=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const uid = data.session.user.id;
      const today = new Date().toISOString().slice(0, 10);
      const { data: existing } = await supabase
        .from("artworks")
        .select("id")
        .eq("user_id", uid)
        .gte("created_at", `${today}T00:00:00`)
        .maybeSingle();
      if (existing) setHasSubmittedToday(true);
    });
  }, []);

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <PrimaryLinkButton
          href={ROUTES.home}
          className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200"
        >
          Back
        </PrimaryLinkButton>
        <div className="animate-[rise-in_700ms_ease-out] flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
              daily draw
            </p>
            <PageTitle className="text-4xl sm:text-5xl md:text-6xl">
              One canvas
              <br />
              2 minutes
            </PageTitle>
            <p className="text-base leading-7 text-stone-700">
              Submit one drawing per day, then let the community rate it in TinderArt.
            </p>
          </div>

          <div className="grid flex-1 gap-5 lg:max-w-xl">
            <div className="rounded-[1.75rem] border border-amber-800 bg-amber-800 px-6 py-5 text-amber-50 shadow-[0_10px_22px_rgba(95,50,10,0.2)]">
              <p className="text-lg font-bold">Today&apos;s challenge</p>
              <p className="mt-2 text-sm leading-6 text-amber-100">
                Draw anything in 3 minutes. You get one official submit per day.
              </p>
              <PrimaryLinkButton
                href={ROUTES.quickplayCreate}
                className="mt-5 w-full !border-white !bg-white !text-amber-900 shadow-[0_8px_18px_rgba(0,0,0,0.14)] hover:!bg-amber-50"
              >
                {hasSubmittedToday ? "View submission" : "Start drawing"}
              </PrimaryLinkButton>
            </div>

            <div className="rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white/85 to-[#fff7ed]/65 px-6 py-5 shadow-[0_8px_24px_rgba(80,40,10,0.08)] backdrop-blur-sm">
              <p className="text-lg font-bold text-stone-900">Community voting</p>
              <p className="mt-2 text-sm leading-6 text-stone-700">
                Rate today&apos;s uploads and push the best art to the top of the daily leaderboard.
              </p>
              <PrimaryLinkButton href={ROUTES.tinderArt} className="mt-5 w-full">
                Open TinderArt
              </PrimaryLinkButton>
            </div>
          </div>
        </div>
      </PageCard>
    </PageShell>
  );
}
