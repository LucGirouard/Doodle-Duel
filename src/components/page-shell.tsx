import { ReactNode } from "react";
import DoodleOverlay from "@/components/doodle-overlay";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "4xl";
};

const maxWidthClass: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export default function PageShell({
  children,
  maxWidth = "4xl",
}: PageShellProps) {
  return (
    <main className="paper-bg relative min-h-screen overflow-hidden px-4 py-5 text-slate-900 sm:px-8 sm:py-8 md:px-10 md:py-10">
      <DoodleOverlay />

      <div
        className={`relative z-20 mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full ${maxWidthClass[maxWidth]} items-center justify-center md:min-h-[calc(100vh-4rem)]`}
      >
        {children}
      </div>
    </main>
  );
}
