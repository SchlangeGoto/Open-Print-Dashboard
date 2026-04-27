import { Button } from "@/components/ui/Button";
import { Check, ChevronRight } from "lucide-react";

interface DoneStepProps {
  onContinue: () => void;
}

export function DoneStep({ onContinue }: DoneStepProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-8 text-center">
      <div className="inline-flex rounded-full bg-green-500/10 p-4 mb-4">
        <Check size={32} className="text-green-400" />
      </div>
      <h2 className="text-xl font-bold mb-2">You&apos;re all set!</h2>
      <p className="text-sm text-muted mb-6">
        Your dashboard is ready to go. Note: You may need to restart the
        backend service for the printer connection to use the new settings.
      </p>
      <Button size="lg" onClick={onContinue}>
        Go to Dashboard <ChevronRight size={16} />
      </Button>
    </div>
  );
}
