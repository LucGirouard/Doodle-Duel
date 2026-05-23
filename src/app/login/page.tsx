"use client";

import Link from "next/link";
import Auth from "../Auth";

export default function LoginPage() {
  return (
    <>
      <header className="absolute top-0 left-0 p-6 sm:p-10 z-50">
        <Link 
          href="/" 
          className="inline-flex items-center text-black hover:text-gray-700 transition-colors duration-200 font-semibold"
        >
          ← Back
        </Link>
      </header>
      <main className="relative min-h-screen overflow-hidden bg-[#f4ede3] px-6 py-8 text-black sm:px-10 sm:py-10">
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
        
        <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
          <div className="relative w-full rounded-[2.5rem] border border-black bg-[#fffaf1]/95 px-8 py-14 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:px-12 sm:py-16">
            <Auth />
          </div>
        </div>
      </main>
    </>
  );
}
