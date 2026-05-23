"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type FormMode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        // Register new user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            confirmPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Sign up failed");
          setLoading(false);
          return;
        }

        // Auto login after signup
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          setError("Sign up successful but login failed");
        } else {
          router.push("/");
        }
      } else {
        // Login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid credentials");
        } else if (result?.ok) {
          router.push("/");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {mode === "signup" && (
          <input
            style={styles.input}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        )}

        <button style={styles.button} type="submit" disabled={loading}>
          {loading
            ? "Loading..."
            : mode === "login"
            ? "Login"
            : "Create Account"}
        </button>
      </form>

      <p style={styles.switchText}>
        {mode === "login"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <span
          style={styles.link}
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
        >
          {mode === "login" ? "Sign up" : "Login"}
        </span>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    padding: "0",
    borderRadius: "0",
    background: "transparent",
    color: "black",
    boxShadow: "none",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "black",
    fontSize: "28px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid black",
    outline: "none",
    background: "#fffaf1",
    color: "black",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid black",
    background: "black",
    color: "#fffaf1",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "8px",
  },
  switchText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px",
    color: "black",
  },
  link: {
    color: "black",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "underline",
  },
  error: {
    padding: "10px",
    marginBottom: "15px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "6px",
    fontSize: "14px",
    border: "1px solid #fecaca",
  },
};