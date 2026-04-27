import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Cloud, ChevronRight, AlertCircle } from "lucide-react";

interface BambuLoginStepProps {
  email: string;
  password: string;
  error: string;
  busy: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BambuLoginStep({
  email,
  password,
  error,
  busy,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: BambuLoginStepProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-green-500/10 p-2 text-green-400">
          <Cloud size={20} />
        </div>
        <div>
          <h2 className="font-semibold">Connect Bambu Lab account</h2>
          <p className="text-xs text-muted">
            Required to access your printer and print history via the cloud.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Bambu Lab Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
        />
        <Input
          label="Bambu Lab Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <Button type="submit" loading={busy} className="w-full" size="lg">
          Continue <ChevronRight size={16} />
        </Button>
      </form>
    </div>
  );
}
