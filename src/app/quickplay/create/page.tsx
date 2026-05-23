import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryLinkButton } from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";

export default function CreateGamePage() {
  return (
    <PageShell maxWidth="2xl">
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          create game
        </p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">
          Room setup coming next
        </PageTitle>
        <p className="mt-4 max-w-lg text-base leading-7 text-stone-700">
          This route is ready for your create-room flow. Next you can generate a
          4-letter code here and send the player into the match lobby.
        </p>

        <PrimaryLinkButton href={ROUTES.quickplay} className="mt-8 px-6">
          Back
        </PrimaryLinkButton>
      </PageCard>
    </PageShell>
  );
}
