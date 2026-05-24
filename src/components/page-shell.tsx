"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DoodleOverlay from "@/components/doodle-overlay";
import AuthControls from "@/components/auth-controls";
import { ROUTES } from "@/lib/constants";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "4xl";
  showDoodles?: boolean;
  showAuthControls?: boolean;
  showHomeButton?: boolean;
};

const maxWidthClass: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export default function PageShell({
  children,
  maxWidth = "4xl",
  showDoodles = false,
  showAuthControls = true,
  showHomeButton,
}: PageShellProps) {
  const pathname = usePathname();
  const shouldShowHomeButton =
    showHomeButton === undefined ? pathname !== ROUTES.home : showHomeButton;
  const reserveTopRailSpace = showAuthControls || shouldShowHomeButton;

  return (
    <main className="paper-bg relative min-h-screen overflow-hidden px-4 py-5 text-slate-900 sm:px-8 sm:py-8 md:px-10 md:py-10">
      {showDoodles ? <DoodleOverlay /> : null}
      {(showAuthControls || shouldShowHomeButton) ? (
        <div className="absolute left-4 right-4 top-4 z-30 flex items-start justify-between sm:left-8 sm:right-8 sm:top-6 md:left-10 md:right-10 md:top-8">
          <div className="pointer-events-auto">
            {shouldShowHomeButton ? (
              <Link
                href={ROUTES.home}
                className="inline-flex h-10 min-w-[78px] items-center justify-center rounded-full border border-stone-300 bg-white/80 px-4 text-xs font-semibold text-stone-700 backdrop-blur-sm transition hover:bg-white"
              >
                Home
              </Link>
            ) : null}
          </div>
          <div className="pointer-events-auto">
            {showAuthControls ? <AuthControls /> : null}
          </div>
        </div>
      ) : null}

      <div
        className={`relative z-20 mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full ${maxWidthClass[maxWidth]} items-center justify-center md:min-h-[calc(100vh-4rem)] ${reserveTopRailSpace ? "pt-12 sm:pt-0" : ""}`}
      >
        {children}
      </div>
    </main>
  );
}
