import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryLinkButton } from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";

export default function Home() {
  return (
    <PageShell maxWidth="4xl" showDoodles>
      <PageCard className="relative px-5 py-10 sm:px-10 sm:py-14 md:px-12 md:py-16">
        <div className="relative flex flex-col items-center text-center animate-[rise-in_700ms_ease-out]">
          <p className="mx-auto text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-500 sm:text-xs sm:tracking-[0.45em]">
            art in a fun reimagined way
          </p>

          <PageTitle className="mt-4 text-5xl sm:mt-5 sm:text-6xl md:text-7xl">
            Doodle Duel
          </PageTitle>

          <p className="mt-5 max-w-sm text-base leading-7 text-stone-700">
            Join the fun
          </p>

          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <PrimaryLinkButton
              href={ROUTES.quickplay}
              className="w-full px-8 text-base shadow-[0_8px_18px_rgba(95,50,10,0.16)] active:translate-y-0 sm:flex-1"
            >
              Daily Draw
            </PrimaryLinkButton>
            <PrimaryLinkButton
              href={ROUTES.rateIt}
              className="w-full px-8 text-base shadow-[0_8px_18px_rgba(95,50,10,0.16)] active:translate-y-0 sm:flex-1"
            >
              Rate It
            </PrimaryLinkButton>
          </div>

          <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-stone-500 sm:text-xs sm:tracking-[0.26em]">
            Move cursor or finger to doodle live
          </p>
        </div>
      </PageCard>
    </PageShell>
  );
}
