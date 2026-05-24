import { supabase } from "./supabase";

export async function registerUser(
  email: string,
  password: string,
  username: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });
  if (error) return { ok: false as const, error: error.message };

  if (!data.user) {
    return { ok: false as const, error: "Registration returned no user." };
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      username,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return {
      ok: false as const,
      error: `Account created, but profile setup failed: ${profileError.message}`,
    };
  }

  return { ok: true as const };
}

export async function loginUser(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function logoutUser() {
  await supabase.auth.signOut();
}