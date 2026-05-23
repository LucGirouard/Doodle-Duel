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
import {
  ROUTES,
  TINDERART_ELO_DOWN,
  TINDERART_ELO_UP,
  TINDERART_STARTING_ELO,
  TINDERART_STORAGE_KEY,
} from "@/lib/constants";

type ArenaCard = {
  id: string;
  src: string;
  elo: number;
};

function nextElo(current: number, liked: boolean) {
  const delta = liked ? TINDERART_ELO_UP : -TINDERART_ELO_DOWN;
  return Math.max(0, Math.min(3000, current + delta));
}

function mockCard(seed: string, color: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
    <rect width="100%" height="100%" fill="${color}" />
    <circle cx="220" cy="220" r="120" fill="rgba(255,255,255,0.35)" />
    <circle cx="560" cy="430" r="180" fill="rgba(0,0,0,0.12)" />
    <text x="50%" y="86%" dominant-baseline="middle" text-anchor="middle"
      font-family="Trebuchet MS, sans-serif" font-size="72" fill="#1f2937">${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function TinderArtArenaPage() {
  const [index, setIndex] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [cards, setCards] = useState<ArenaCard[]>(() => {
    if (typeof window === "undefined") return [];

    const raw = window.localStorage.getItem(TINDERART_STORAGE_KEY);
    const uploadedCards: ArenaCard[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.filter(Boolean).forEach((src: string, i: number) =>
            uploadedCards.push({
              id: `upload-${i}`,
              src,
              elo: TINDERART_STARTING_ELO,
            }),
          );
        }
      } catch {}
    }

    return [
      ...uploadedCards,
      {
        id: "mock-1",
        src: mockCard("Sketch #1", "#fde68a"),
        elo: TINDERART_STARTING_ELO,
      },
      {
        id: "mock-2",
        src: mockCard("Sketch #2", "#bfdbfe"),
        elo: TINDERART_STARTING_ELO,
      },
      {
        id: "mock-3",
        src: mockCard("Sketch #3", "#c4b5fd"),
        elo: TINDERART_STARTING_ELO,
      },
      {
        id: "mock-4",
        src: mockCard("Sketch #4", "#fbcfe8"),
        elo: TINDERART_STARTING_ELO,
      },
      {
        id: "mock-5",
        src: mockCard("Sketch #5", "#bbf7d0"),
        elo: TINDERART_STARTING_ELO,
      },
    ];
  });

  if (cards.length === 0) {
    return null;
  }

  const complete = index >= cards.length;
  const currentIndex = Math.min(index, cards.length - 1);
  const current = cards[currentIndex];
  const leaderboard = [...cards].sort((a, b) => b.elo - a.elo);
  const topThree = leaderboard.slice(0, 3);

  const onSwipe = (liked: boolean) => {
    if (complete) return;
    setCards((prev) => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        elo: nextElo(next[currentIndex].elo, liked),
      };
      return next;
    });
    setIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (complete) {
      const timer = window.setTimeout(() => setShowLeaderboard(true), 550);
      return () => window.clearTimeout(timer);
    }
  }, [complete]);

  const onTouchStart = (clientX: number) => {
    setTouchStartX(clientX);
    setTouchDeltaX(0);
  };

  const onTouchMove = (clientX: number) => {
    if (touchStartX === null) return;
    setTouchDeltaX(clientX - touchStartX);
  };

  const onTouchEnd = () => {
    const threshold = 70;
    if (touchDeltaX > threshold) onSwipe(true);
    if (touchDeltaX < -threshold) onSwipe(false);
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <PageShell maxWidth="2xl">
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          tinderart arena
        </p>
        {!complete ? (
          <>
            <PageTitle className="mt-4 text-4xl sm:text-5xl">
              Swipe and rate art
            </PageTitle>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-600">
                Artwork ELO
              </p>
              <p className="text-2xl font-black text-stone-900">
                {current.elo}
              </p>
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
              }}
            >
              <Image
                src={current.src}
                alt="Arena artwork card"
                width={800}
                height={800}
                unoptimized
                className="aspect-square w-full object-cover"
              />
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
                <div className="grid gap-3 sm:grid-cols-3">
                  {topThree.map((card, rank) => (
                    <div
                      key={`top-${card.id}`}
                      className="rounded-xl border border-stone-200 bg-white/75 p-3"
                    >
                      <div className="overflow-hidden rounded-lg border border-stone-200">
                        <Image
                          src={card.src}
                          alt={`Top artwork ${rank + 1}`}
                          width={220}
                          height={220}
                          unoptimized
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        Rank {rank + 1}
                      </p>
                      <p className="mt-1 text-lg font-black text-stone-900">
                        {card.elo}
                      </p>
                    </div>
                  ))}
                </div>

                {leaderboard.map((card, rank) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-white/70 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-stone-700">
                      #{rank + 1}
                    </p>
                    <p className="text-sm font-semibold text-stone-600">
                      {card.id}
                    </p>
                    <p className="text-base font-black text-stone-900">
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

        <div className="mt-6">
          <PrimaryLinkButton
            href={ROUTES.tinderArt}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:w-auto"
          >
            Go back
          </PrimaryLinkButton>
        </div>
      </PageCard>
    </PageShell>
  );
}
