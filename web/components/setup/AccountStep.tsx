import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, ChevronRight, AlertCircle } from "lucide-react";

interface AccountStepProps {
  username: string;
  password: string;
  confirmPassword: string;
  error: string;
  busy: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AccountStep({
  username,
  password,
  confirmPassword,
  error,
  busy,
  onUsernameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: AccountStepProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
          <User size={20} />
        </div>
        <div>
          <h2 className="font-semibold">Create your account</h2>
          <p className="text-xs text-muted">
            This will be the only account with access to this dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Username"
          placeholder="admin"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
