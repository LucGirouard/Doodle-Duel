import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryLinkButton } from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  return (
    <PageShell maxWidth="4xl">
      <PageCard className="relative px-5 py-10 sm:px-10 sm:py-14 md:px-12 md:py-16">
        <div className="relative flex flex-col items-center text-center animate-[rise-in_700ms_ease-out]">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
            sketching 1v1 game
          </p>

          <PageTitle className="mt-4 text-5xl sm:mt-5 sm:text-6xl md:text-7xl">
            Art Battle
          </PageTitle>

          <p className="mt-5 max-w-sm text-base leading-7 text-stone-700">
            Intense battles!
          </p>

          <PrimaryLinkButton
            href={ROUTES.quickplay}
            className="mt-8 px-8 text-base shadow-[0_8px_18px_rgba(95,50,10,0.16)] active:translate-y-0"
          >
            Quickplay
          </PrimaryLinkButton>

          <p className="mt-4 text-xs uppercase tracking-[0.26em] text-stone-500">
            Move cursor or finger to doodle live
          </p>
        </div>
      </PageCard>
    </PageShell>
  );
}
