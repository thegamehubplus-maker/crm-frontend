"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Simple login page. It captures email and password and posts them to
 * our internal /api/auth/login route. On success it redirects to the
 * contacts page. Errors are displayed inline. Default credentials are
 * prefilled for convenience during development and testing.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("owner@thagamehub.ru");
  const [password, setPassword] = useState("Doommy2023");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (resp.ok) {
      router.push("/contacts");
    } else {
      const j = await resp.json().catch(() => ({}));
      setErr(j?.detail || "Login failed");
    }
    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 420, margin: "60px auto", padding: 24 }}>
      <h1>Login</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button disabled={loading}>{loading ? "..." : "Sign in"}</button>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </main>
  );
}
