import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryLinkButton } from "@/components/ui/primary-button";
import { ROUTES } from "@/lib/constants";
import { isValidRoomCode, sanitizeRoomCode } from "@/lib/room-code";

type JoinPageProps = {
  params: Promise<{ code: string }>;
};

export default async function JoinGamePage({ params }: JoinPageProps) {
  const { code } = await params;
  const normalizedCode = sanitizeRoomCode(code);
  const validCode = isValidRoomCode(normalizedCode);

  return (
    <PageShell maxWidth="2xl">
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          join game
        </p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">Joining {normalizedCode}</PageTitle>
        <p className="mt-4 max-w-lg text-base leading-7 text-stone-700">
          {validCode
            ? "Room lookup and lobby sync can plug in here when backend matchmaking is connected."
            : "Invalid code format. Room codes use 4 letters."}
        </p>

        <PrimaryLinkButton href={ROUTES.quickplay} className="mt-8 px-6">
          Back
        </PrimaryLinkButton>
      </PageCard>
    </PageShell>
  );
}

