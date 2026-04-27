import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Printer, Check, AlertCircle, Info, ExternalLink } from "lucide-react";

interface PrinterStepProps {
  printerIp: string;
  printerSerial: string;
  printerAccessCode: string;
  error: string;
  busy: boolean;
  onIpChange: (v: string) => void;
  onSerialChange: (v: string) => void;
  onAccessCodeChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PrinterStep({
  printerIp,
  printerSerial,
  printerAccessCode,
  error,
  busy,
  onIpChange,
  onSerialChange,
  onAccessCodeChange,
  onSubmit,
}: PrinterStepProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
          <Printer size={20} />
        </div>
        <div>
          <h2 className="font-semibold">Printer configuration</h2>
          <p className="text-xs text-muted">
            Connect to your printer via local network.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center gap-2 w-full rounded-lg border border-blue-800 bg-blue-900/20 p-3 text-sm text-blue-300 mb-4 hover:bg-blue-900/30 transition-colors text-left"
      >
        <Info size={16} className="shrink-0" />
        <span>Where do I find these values? Click to expand.</span>
      </button>

      {showHelp && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-300 mb-4 space-y-2">
          <p>
            <strong>Printer IP:</strong> Found in your printer&apos;s network
            settings or your router&apos;s DHCP client list.
          </p>
          <p>
            <strong>Serial Number:</strong> On the printer → Settings → Device
            → Serial Number. Or check the sticker on the back of the machine.
          </p>
          <p>
            <strong>Access Code:</strong> On the printer → Settings → Network →
            Access Code (LAN mode must be enabled).
          </p>
          <a
            href="https://wiki.bambulab.com/en/general/find-sn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline mt-1"
          >
            Bambu Lab Wiki — Finding serial number
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Printer IP Address"
          placeholder="192.168.0.100"
          value={printerIp}
          onChange={(e) => onIpChange(e.target.value)}
          required
        />
        <Input
          label="Printer Serial Number"
          placeholder="03919C462700XXX"
          value={printerSerial}
          onChange={(e) => onSerialChange(e.target.value)}
          required
        />
        <Input
          label="Access Code"
          placeholder="12345678"
          value={printerAccessCode}
          onChange={(e) => onAccessCodeChange(e.target.value)}
          required
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <Button type="submit" loading={busy} className="w-full" size="lg">
          Finish Setup <Check size={16} />
        </Button>
      </form>
    </div>
  );
}
