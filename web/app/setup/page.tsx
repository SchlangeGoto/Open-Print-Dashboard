"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Disc3, Check } from "lucide-react";
import { AccountStep } from "@/components/setup/AccountStep";
import { BambuLoginStep } from "@/components/setup/BambuLoginStep";
import { BambuVerifyStep } from "@/components/setup/BambuVerifyStep";
import { PrinterStep } from "@/components/setup/PrinterStep";
import { DoneStep } from "@/components/setup/DoneStep";

type SetupStep = "account" | "bambu" | "bambu-code" | "printer" | "done";

const steps = [
  { key: "account", label: "Create Account" },
  { key: "bambu", label: "Bambu Lab Login" },
  { key: "printer", label: "Printer Setup" },
];

export default function SetupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<SetupStep>("account");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Account fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Bambu fields
  const [bambuEmail, setBambuEmail] = useState("");
  const [bambuPassword, setBambuPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  // Printer fields
  const [printerIp, setPrinterIp] = useState("");
  const [printerSerial, setPrinterSerial] = useState("");
  const [printerAccessCode, setPrinterAccessCode] = useState("");

  // Redirect if already set up
  useEffect(() => {
    api.getSetupStatus().then((status) => {
      if (status.setup_complete) {
        router.push("/");
      } else if (status.user_created && !status.bambu_logged_in) {
        setStep("bambu");
      } else if (status.user_created && status.bambu_logged_in && !status.printer_configured) {
        setStep("printer");
      }
    }).catch(() => {});
  }, [router]);

  const currentStepIndex = steps.findIndex(
    (s) => s.key === step || (step === "bambu-code" && s.key === "bambu"),
  );

  // ─── Account creation ───────────────────────────
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setBusy(true);
    try {
      const res = await api.register(username, password);
      if (res.ok) {
        login(res.username);
        setStep("bambu");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setBusy(false);
    }
  }

  // ─── Bambu Lab login ────────────────────────────
  async function handleBambuLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await api.bambuLoginStart(bambuEmail, bambuPassword);
      if (res.requireCode) {
        setStep("bambu-code");
      } else {
        setStep("printer");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleBambuVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await api.bambuLoginVerify(verifyCode);
      if (res.codeExpired) {
        await api.bambuLoginStart(bambuEmail, bambuPassword);
        setError("Code expired — a new one has been sent");
        setVerifyCode("");
      } else {
        setStep("printer");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  // ─── Printer setup ─────────────────────────────
  async function handlePrinterSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await api.saveSetting("printer_ip", printerIp);
      await api.saveSetting("printer_serial", printerSerial);
      await api.saveSetting("printer_access_code", printerAccessCode);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Failed to save printer settings");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex rounded-2xl bg-accent/10 p-4 mb-4">
            <Disc3 size={32} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Setup Open Print Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Let&apos;s get everything configured
          </p>
        </div>

        {/* Progress */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < currentStepIndex
                      ? "bg-green-600 text-white"
                      : i === currentStepIndex
                        ? "bg-accent text-white"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {i < currentStepIndex ? <Check size={14} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-8 ${
                      i < currentStepIndex ? "bg-green-600" : "bg-zinc-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {step === "account" && (
          <AccountStep
            username={username}
            password={password}
            confirmPassword={confirmPassword}
            error={error}
            busy={busy}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleCreateAccount}
          />
        )}

        {step === "bambu" && (
          <BambuLoginStep
            email={bambuEmail}
            password={bambuPassword}
            error={error}
            busy={busy}
            onEmailChange={setBambuEmail}
            onPasswordChange={setBambuPassword}
            onSubmit={handleBambuLogin}
          />
        )}

        {step === "bambu-code" && (
          <BambuVerifyStep
            verifyCode={verifyCode}
            error={error}
            busy={busy}
            onCodeChange={setVerifyCode}
            onSubmit={handleBambuVerify}
          />
        )}

        {step === "printer" && (
          <PrinterStep
            printerIp={printerIp}
            printerSerial={printerSerial}
            printerAccessCode={printerAccessCode}
            error={error}
            busy={busy}
            onIpChange={setPrinterIp}
            onSerialChange={setPrinterSerial}
            onAccessCodeChange={setPrinterAccessCode}
            onSubmit={handlePrinterSetup}
          />
        )}

        {step === "done" && (
          <DoneStep onContinue={() => router.push("/dashboard")} />
        )}
      </div>
    </main>
  );
}
