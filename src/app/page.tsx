"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4ede3] px-6 py-8 text-stone-900 sm:px-10 sm:py-10">
      {/* Sign In Button - Only show when not logged in, positioned same as UserMenu */}
      {!session && (
        <div style={styles.signInWrapper}>
          <Link
            href="/login"
            style={styles.signInButton}
          >
            Sign In
          </Link>
        </div>
      )}
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

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="relative w-full rounded-[2.5rem] border border-stone-300/80 bg-[#fffaf1]/95 px-8 py-14 shadow-[0_24px_80px_rgba(80,55,30,0.16)] sm:px-12 sm:py-16">
          <div className="relative flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
              sketching 1v1 game
            </p>

            <Link href="/" className="cursor-pointer">
              <h1
                className="mt-5 text-6xl font-black tracking-tight text-stone-900 sm:text-7xl hover:opacity-80 transition-opacity"
                style={{ fontFamily: '"Chalkboard SE", "Comic Sans MS", cursive' }}
              >
                Art Battle
              </h1>
            </Link>

            <p className="mt-5 max-w-sm text-base leading-7 text-stone-600">
              Intense battles!
            </p>

            <Link
              href="/quickplay"
              className="mt-10 inline-flex items-center rounded-full border border-stone-900 bg-stone-900 px-8 py-3 text-base font-semibold text-[#fffaf1] shadow-[0_10px_24px_rgba(30,20,10,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-stone-800 active:translate-y-0"
            >
              Quickplay
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  signInWrapper: {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: 1000,
  },
  signInButton: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "9999px",
    border: "1px solid #000",
    backgroundColor: "#000",
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingTop: "8px",
    paddingBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#fffaf1",
    boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
    transition: "transform 0.2s, background-color 0.2s",
    textDecoration: "none",
  },
};

