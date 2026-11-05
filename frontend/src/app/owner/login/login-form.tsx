"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function LoginForm() {
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Only allow redirects back into the owner portal or CRM (no open redirect)
  const rawNext = params.get("next") || "";
  const safeNext = /^\/(owner|crm)(\/|$|\?)/.test(rawNext) ? rawNext : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.message || "Sign in failed. Please try again.");
        return;
      }
      const me = json.data || {};
      // Sales reps can't open the owner portal; send everyone somewhere they can use
      let dest = safeNext || me.home || "/owner";
      if (dest.startsWith("/owner") && !me.is_staff) dest = "/crm";
      window.location.href = dest;
    } catch {
      setError("Can't reach the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-brand-navy/5"
      aria-labelledby="owner-login-title"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" alt="Spirit Adventures" className="mx-auto mb-6 h-10 w-auto" />
      <h1 id="owner-login-title" className="text-center font-display text-2xl font-bold text-brand-navy">
        Team sign in
      </h1>
      <p className="mt-1 mb-6 text-center text-sm text-slate-500">Owner portal and sales CRM, one login.</p>

      <label htmlFor="owner-username" className="block text-xs font-semibold text-slate-700">Email</label>
      <input
        id="owner-username"
        type="email"
        inputMode="email"
        autoComplete="username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-1 mb-4 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm outline-none transition focus:border-brand-ocean focus:ring-2 focus:ring-brand-ocean/20"
      />

      <label htmlFor="owner-password" className="block text-xs font-semibold text-slate-700">Password</label>
      <input
        id="owner-password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-base sm:text-sm outline-none transition focus:border-brand-ocean focus:ring-2 focus:ring-brand-ocean/20"
      />

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-ocean py-3 text-sm font-bold text-white shadow-lg shadow-brand-ocean/20 transition hover:bg-brand-navy active:scale-[0.98] disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-4 text-center text-[11px] text-slate-400">
        No account yet? Ask your manager to add you in the CRM Team tab.
      </p>
    </form>
  );
}
