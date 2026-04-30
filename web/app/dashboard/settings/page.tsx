"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Printer, Cloud, LogOut, Save, CheckCircle2, ExternalLink, User } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { logout, username } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [printerIp, setPrinterIp] = useState("");
  const [printerSerial, setPrinterSerial] = useState("");
  const [printerAccessCode, setPrinterAccessCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSettings().then((data) => {
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value; });
      setSettings(map);
      setPrinterIp(map.printer_ip ?? "");
      setPrinterSerial(map.printer_serial ?? "");
      setPrinterAccessCode(map.printer_access_code ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function savePrinterConfig(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveSetting("printer_ip", printerIp);
      await api.saveSetting("printer_serial", printerSerial);
      await api.saveSetting("printer_access_code", printerAccessCode);
      toast.success("Settings saved. Restart backend to apply.");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[...Array(3)].map((_, i) => <div key={i} className="h-36 skeleton rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl pb-8">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs text-muted mt-0.5">Dashboard configuration</p>
      </div>

      {/* Account */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-950/50 p-2.5"><User size={18} className="text-blue-400" /></div>
          <div>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in as <span className="font-semibold text-zinc-300">{username}</span></CardDescription>
          </div>
        </div>
        <Button variant="danger" size="sm" onClick={logout}>
          <LogOut size={13} /> Sign Out
        </Button>
      </Card>

      {/* Bambu Cloud */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-emerald-950/50 p-2.5"><Cloud size={18} className="text-emerald-400" /></div>
          <div>
            <CardTitle>Bambu Lab Cloud</CardTitle>
            <CardDescription>
              {settings.bambu_cloud_token ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} /> Connected
                </span>
              ) : "Not connected — complete setup to connect"}
            </CardDescription>
          </div>
        </div>
        {settings.bambu_cloud_email && (
          <p className="text-xs text-muted">Account: {settings.bambu_cloud_email}</p>
        )}
      </Card>

      {/* Printer Config */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-xl bg-purple-950/50 p-2.5"><Printer size={18} className="text-purple-400" /></div>
          <div>
            <CardTitle>Printer Connection</CardTitle>
            <CardDescription>Local network settings. Restart backend after changes.</CardDescription>
          </div>
        </div>
        <form onSubmit={savePrinterConfig} className="space-y-4">
          <Input label="Printer IP" placeholder="192.168.0.100" value={printerIp} onChange={(e) => setPrinterIp(e.target.value)} />
          <Input label="Serial Number" placeholder="03919C462700XXX" value={printerSerial} onChange={(e) => setPrinterSerial(e.target.value)} />
          <Input label="Access Code" placeholder="••••••••" value={printerAccessCode} onChange={(e) => setPrinterAccessCode(e.target.value)} />
          <div className="flex items-center gap-4">
            <Button type="submit" loading={saving} size="sm">
              <Save size={13} /> Save
            </Button>
            <a
              href="https://wiki.bambulab.com/en/general/find-sn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              How to find these values <ExternalLink size={11} />
            </a>
          </div>
        </form>
      </Card>

      {/* Raw Settings */}
      <Card>
        <CardTitle className="mb-1">All Settings</CardTitle>
        <CardDescription>Raw values stored in database</CardDescription>
        <div className="mt-4 space-y-1">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center text-xs py-2 border-b border-zinc-800/30 last:border-0">
              <span className="font-mono text-muted">{key}</span>
              <span className="text-right truncate max-w-[200px] text-zinc-400">
                {key.includes("password") || key.includes("token") || key.includes("access_code") || key.includes("key")
                  ? "••••••••"
                  : value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
