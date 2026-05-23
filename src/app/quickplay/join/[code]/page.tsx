import Link from "next/link";

type JoinPageProps = {
  params: Promise<{ code: string }>;
};

export default async function JoinGamePage({ params }: JoinPageProps) {
  const { code } = await params;
  const normalizedCode = code.toUpperCase();

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 text-stone-900 sm:px-10 sm:py-10">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
        <section className="w-full rounded-[2.5rem] border border-stone-300/80 bg-[#fffaf1]/95 px-8 py-12 shadow-[0_24px_80px_rgba(80,55,30,0.16)] sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
            join game
          </p>
          <h1
            className="mt-4 text-5xl font-black tracking-tight text-stone-900"
            style={{ fontFamily: '"Chalkboard SE", "Comic Sans MS", cursive' }}
          >
            Joining {normalizedCode}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-stone-600">
            This is the placeholder join route for a 4-letter room code.
          </p>

          <Link
            href="/quickplay"
            className="mt-8 inline-flex items-center rounded-full border border-stone-900 bg-stone-900 px-6 py-3 text-sm font-semibold text-[#fffaf1] hover:bg-stone-800"
          >
            Back
          </Link>
        </section>
      </div>
    </main>
  );
}