import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · PRO Vault" },
      { name: "description", content: "Sign in to your PRO Vault workspace to manage UAE trade licenses and personnel documents." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/documents" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") navigate({ to: "/documents" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/documents" },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--gold)]/10">
            <ShieldCheck className="h-6 w-6 text-[color:var(--gold)]" strokeWidth={1.75} />
          </span>
          <span className="text-lg font-semibold tracking-tight">PRO Vault</span>
        </div>
        <div className="card-elevated p-6">
          <h1 className="text-xl font-semibold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your PRO Vault workspace." : "Start tracking UAE documents in minutes."}
          </p>

          <button
            type="button"
            onClick={onGoogle}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground transition-colors hover:border-[color:var(--gold)]/50"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.9 2.5 30.5 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.4 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 6.9-10 6.9-17.5z"/>
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.8l7.9-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-3.9-13.5-9.3l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.ae"
              className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[color:var(--gold)] text-sm font-semibold text-background shadow-[0_0_12px_rgba(212,168,83,0.25)] hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New here?" : "Have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-semibold text-[color:var(--gold)] hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
