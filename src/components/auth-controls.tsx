"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ROUTES } from "@/lib/constants";
import { PrimaryLinkButton } from "@/components/ui/primary-button";

export default function AuthControls() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id;
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", uid)
        .maybeSingle();
      if (profile) setUsername(profile.username);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const onLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = ROUTES.home;
  };

  return (
    <div>
      {username ? (
        <div className="flex h-10 items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-3 backdrop-blur-sm">
          <span className="max-w-[130px] truncate text-xs font-semibold text-stone-700 sm:max-w-[180px]">
            {username}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-8 min-w-[78px] items-center justify-center rounded-full border border-stone-300 bg-white/80 px-4 text-xs font-semibold text-stone-700 transition hover:bg-white"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <PrimaryLinkButton
            href={`${ROUTES.auth}?mode=login`}
            className="px-4 py-2 text-xs"
          >
            Login
          </PrimaryLinkButton>
        </div>
      )}
    </div>
  );
}