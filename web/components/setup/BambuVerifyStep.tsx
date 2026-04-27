import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Cloud, ChevronRight, AlertCircle } from "lucide-react";

interface BambuVerifyStepProps {
  verifyCode: string;
  error: string;
  busy: boolean;
  onCodeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BambuVerifyStep({
  verifyCode,
  error,
  busy,
  onCodeChange,
  onSubmit,
}: BambuVerifyStepProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
          <Cloud size={20} />
        </div>
        <div>
          <h2 className="font-semibold">Verification code</h2>
          <p className="text-xs text-muted">
            A verification code was sent to your email.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-700 bg-amber-950/40 p-3 text-sm text-amber-200 mb-4">
        Check your email for the 6-digit verification code from Bambu Lab.
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Verification Code"
          inputMode="numeric"
          placeholder="123456"
          value={verifyCode}
          onChange={(e) => onCodeChange(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <Button type="submit" loading={busy} className="w-full" size="lg">
          Verify <ChevronRight size={16} />
        </Button>
      </form>
    </div>
  );
}
