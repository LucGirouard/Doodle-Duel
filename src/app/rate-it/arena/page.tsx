"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import {
  PrimaryButton,
  PrimaryLinkButton,
} from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";
import { getLocalDayRange } from "@/lib/day";
import { supabase } from "@/lib/supabase";

type ArenaCard = { id: string; src: string; elo: number; username: string };

const ELO_BASELINE = 1000;
const ELO_K = 24;

function nextScore(current: number, liked: boolean, opponent = ELO_BASELINE) {
  const expected = 1 / (1 + Math.pow(10, (opponent - current) / 400));
  const actual = liked ? 1 : 0;
  const updated = Math.round(current + ELO_K * (actual - expected));
  return Math.max(0, Math.min(3000, updated));
}

export default function RateItArenaPage() {
  const [cards, setCards] = useState<ArenaCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = `/auth?mode=login&next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);
      const { startIso, endIso } = getLocalDayRange();

      const { data: artworks } = await supabase
        .from("artworks")
        .select("id, image_url, elo, username")
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .order("created_at", { ascending: false });

      if (artworks) {
        setCards(
          artworks.map((a) => ({
            id: a.id,
            src: a.image_url,
            elo: a.elo,
            username: a.username ?? "Anonymous",
          })),
        );
      }
      setLoading(false);
    });
  }, []);

  const complete = !loading && index >= cards.length;
  const current = cards[index];
  const leaderboard = [...cards].sort((a, b) => b.elo - a.elo);
  const topThree = leaderboard.slice(0, 3);

  const onSwipe = async (liked: boolean) => {
    if (!current) return;
    const newScore = nextScore(current.elo, liked);

    await supabase
      .from("artworks")
      .update({ elo: newScore })
      .eq("id", current.id);

    if (userId) {
      await supabase.from("votes").insert({
        user_id: userId,
        winner_id: liked ? current.id : null,
        loser_id: liked ? null : current.id,
      });
    }

    setCards((prev) =>
      prev.map((c) => (c.id === current.id ? { ...c, elo: newScore } : c)),
    );
    setIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (complete && cards.length > 0) {
      const timer = window.setTimeout(() => setShowLeaderboard(true), 550);
      return () => window.clearTimeout(timer);
    }
  }, [complete, cards.length]);

  const onTouchStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchDeltaX(0);
  };
  const onTouchMove = (clientX: number) => {
    if (touchStartX !== null) setTouchDeltaX(clientX - touchStartX);
  };
  const onTouchEnd = () => {
    if (touchDeltaX > 70) onSwipe(true);
    if (touchDeltaX < -70) onSwipe(false);
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  if (loading) return null;

  if (cards.length === 0) {
    return (
      <PageShell maxWidth="2xl">
        <PageCard className="px-5 py-10 sm:px-8 sm:py-12 md:px-12">
          <PrimaryLinkButton
            href={ROUTES.rateIt}
            className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200"
          >
            Back
          </PrimaryLinkButton>
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <PageTitle className="text-4xl sm:text-5xl">
              No art yet today
            </PageTitle>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-700">
              Nobody has submitted a daily draw yet. Be the first!
            </p>
            <PrimaryLinkButton
              href={ROUTES.quickplayCreate}
              className="mt-7 w-full sm:max-w-md"
            >
              Open Daily Draw
            </PrimaryLinkButton>
          </div>
        </PageCard>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="2xl">
      <PageCard className="animate-[rise-in_700ms_ease-out] px-5 py-9 sm:px-8 sm:py-11 md:px-12">
        <PrimaryLinkButton
          href={ROUTES.rateIt}
          className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200"
        >
          Back
        </PrimaryLinkButton>
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          arena
        </p>

        {!complete ? (
          <>
            <PageTitle className="mt-4 text-4xl sm:text-5xl">
              Swipe to rate!
            </PageTitle>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
                Score
              </p>
              <p className="text-2xl font-black text-stone-900">
                {current.elo}
              </p>
            </div>
            <div className="mt-2 text-sm font-semibold text-stone-700">
              by {current.username}
            </div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {index + 1} / {cards.length}
            </div>
            <div
              className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white/70"
              onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
              onTouchMove={(e) => onTouchMove(e.touches[0].clientX)}
              onTouchEnd={onTouchEnd}
              style={{
                transform: `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.02}deg)`,
                transition:
                  touchStartX === null ? "transform 180ms ease" : "none",
                backgroundColor:
                  touchDeltaX > 30
                    ? "rgba(34,197,94,0.08)"
                    : touchDeltaX < -30
                      ? "rgba(239,68,68,0.08)"
                      : undefined,
              }}
            >
              <div className="bg-[#fffaf1]">
                <Image
                  src={current.src}
                  alt="Arena artwork"
                  width={800}
                  height={800}
                  unoptimized
                  className="h-[clamp(360px,62dvh,760px)] w-full object-contain"
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs uppercase tracking-[0.2em] text-stone-500 sm:hidden">
              Swipe left for no, right for yes
            </p>
            <div className="mt-6 hidden gap-3 sm:flex">
              <PrimaryButton
                type="button"
                onClick={() => onSwipe(false)}
                className="w-full border-stone-500 bg-stone-500 hover:bg-stone-600 sm:flex-1"
              >
                No
              </PrimaryButton>
              <PrimaryButton
                type="button"
                onClick={() => onSwipe(true)}
                className="w-full sm:flex-1"
              >
                Yes
              </PrimaryButton>
            </div>
          </>
        ) : (
          <>
            <PageTitle className="mt-4 text-4xl sm:text-5xl">
              All cards rated
            </PageTitle>
            <p className="mt-4 text-base leading-7 text-stone-700">
              You completed this arena run. Here are the artwork rankings.
            </p>
            {showLeaderboard ? (
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {topThree.map((card, rank) => (
                    <div
                      key={`top-${card.id}`}
                      className="rounded-xl border border-stone-200 bg-white/75 p-2 sm:p-3"
                    >
                      <div className="overflow-hidden rounded-lg border border-stone-200">
                        <Image
                          src={card.src}
                          alt={`Top ${rank + 1}`}
                          width={220}
                          height={220}
                          unoptimized
                          className="aspect-square w-full bg-[#fffaf1] object-contain"
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-500 sm:mt-2 sm:text-xs sm:tracking-[0.2em]">
                        Rank {rank + 1}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-stone-800 sm:mt-1 sm:text-base">
                        {card.username}
                      </p>
                      <p className="text-sm font-black text-stone-900 sm:text-lg">
                        {card.elo}
                      </p>
                    </div>
                  ))}
                </div>
                {leaderboard.slice(3).map((card, rank) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-white/70 px-3 py-2 sm:px-4 sm:py-3"
                  >
                    <p className="text-xs font-semibold text-stone-700 sm:text-sm">
                      #{rank + 4}
                    </p>
                    <p className="max-w-[45%] truncate text-xs font-semibold text-stone-600 sm:text-sm">
                      {card.username}
                    </p>
                    <p className="text-sm font-black text-stone-900 sm:text-base">
                      {card.elo}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Building leaderboard...
                </p>
              </div>
            )}
          </>
        )}
      </PageCard>
    </PageShell>
  );
}