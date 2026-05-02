"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Disc3, AlertCircle, FlaskConical } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { username, isLoading, login } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Pre-fill saved demo credentials as a hint
  const [savedUsername, setSavedUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSavedUsername(localStorage.getItem("demo_username"));
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (username) {
      router.push("/dashboard");
      return;
    }

    api.userExists()
      .then((data) => {
        if (!data.exists) {
          setNeedsSetup(true);
          router.push("/setup");
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [isLoading, username, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    // Demo mode: use whatever was typed, or fall back to saved/default
    const savedUser = typeof window !== "undefined"
      ? localStorage.getItem("demo_username")
      : null;
    const finalUsername = loginUsername.trim() || savedUser || "demo";
    const finalPassword = loginPassword || "demo";

    try {
      const result = await api.loginUser(finalUsername, finalPassword);
      if (result.ok) {
        login(result.username, result.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading || checking || needsSetup) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted">
          <Disc3 className="animate-spin text-accent" size={20} />
          <span className="text-sm">Loading...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex rounded-2xl bg-accent/10 p-4 mb-4 ring-1 ring-accent/20">
            <Disc3 size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to your dashboard</p>
        </div>

        {/* Demo hint */}
        <div className="flex items-start gap-2.5 rounded-xl border border-violet-700/50 bg-violet-950/40 px-4 py-3 text-sm text-violet-300 mb-5">
          <FlaskConical size={15} className="shrink-0 mt-0.5 text-violet-400" />
          <span>
            Demo mode —{" "}
            {savedUsername ? (
              <>
                sign in as <strong className="text-violet-200">{savedUsername}</strong> with
                your setup password, or just leave the fields empty and click Sign in.
              </>
            ) : (
              "leave the fields empty and click Sign in, or type anything."
            )}
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Username"
            placeholder={savedUsername ? savedUsername : "Leave empty or type anything"}
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Leave empty or type anything"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Button type="submit" loading={busy} className="w-full" size="lg">
            Sign in
          </Button>
        </form>
      </div>
    </main>
  );
}