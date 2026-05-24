"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryButton, PrimaryLinkButton } from "@/components/ui/primary-button";
import { loginUser, registerUser } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

type Mode = "login" | "register";

function AuthPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const mode: Mode = search.get("mode") === "register" ? "register" : "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const requestedNext = search.get("next") || ROUTES.home;
  const nextRoute = requestedNext.startsWith("/") ? requestedNext : ROUTES.home;

  const onSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }
    if (mode === "register" && !username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result =
      mode === "register"
        ? await registerUser(email, password, username.trim())
        : await loginUser(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(nextRoute);
  };

  return (
    <PageShell maxWidth="2xl" showDoodles={false} showAuthControls={false} showHomeButton={false}>
      <PageCard className="px-5 py-9 sm:px-8 sm:py-11 md:px-12 animate-[rise-in_700ms_ease-out]">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">account</p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">
          {mode === "login" ? "Login" : "Register"}
        </PageTitle>

        <div className="mt-6 space-y-3">
          {mode === "register" && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-2xl border border-stone-300 bg-[#fffaf1] px-4 py-3 text-sm text-stone-800 outline-none focus:border-amber-700"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-stone-300 bg-[#fffaf1] px-4 py-3 text-sm text-stone-800 outline-none focus:border-amber-700"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-stone-300 bg-[#fffaf1] px-4 py-3 text-sm text-stone-800 outline-none focus:border-amber-700"
          />
        </div>

        {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton onClick={onSubmit} className="w-full sm:flex-1">
            {mode === "login" ? "Login" : "Create account"}
          </PrimaryButton>
          <PrimaryLinkButton
            href={ROUTES.home}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:flex-1"
          >
            Back
          </PrimaryLinkButton>
        </div>

        {mode === "login" ? (
          <p className="mt-5 text-sm text-stone-700">
            Don&apos;t have an account?{" "}
            <Link href={`${ROUTES.auth}?mode=register&next=${encodeURIComponent(nextRoute)}`}
              className="font-semibold text-amber-800 underline decoration-amber-700/70 underline-offset-4">
              Register here
            </Link>
          </p>
        ) : (
          <p className="mt-5 text-sm text-stone-700">
            Already have an account?{" "}
            <Link href={`${ROUTES.auth}?mode=login&next=${encodeURIComponent(nextRoute)}`}
              className="font-semibold text-amber-800 underline decoration-amber-700/70 underline-offset-4">
              Login here
            </Link>
          </p>
        )}
      </PageCard>
    </PageShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}