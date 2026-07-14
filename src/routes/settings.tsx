import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ShieldCheck, HardDrive, Lock, Database } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Settings" description="Session, backups, and production hardening notes." />
      <Section className="space-y-4 max-w-3xl">
        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Session & security</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            {[["Require 2FA for administrators", true], ["Auto sign-out after 30 min idle", true], ["Restrict access by IP", false], ["Google Calendar sync", false]].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><HardDrive className="h-4 w-4" />Backup status</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Last backup</span><span>Today, 03:00 AM</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Backup frequency</span><span>Every 6 hours</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Retention</span><span>30 days</span></div>
            <Button variant="outline" size="sm" className="mt-2">Run backup now</Button>
          </CardContent>
        </Card>

        <Card className="border-info/40 bg-info/5"><CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Production hardening</CardTitle></CardHeader>
          <CardContent className="p-4 text-sm space-y-2">
            <p>This preview is a demo build. Before shipping to real customer data, wire up:</p>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-xs">
              <li>Server-side authorization with per-user sessions (not role switcher)</li>
              <li>Postgres row-level security scoped to <code>auth.uid()</code></li>
              <li>Encrypted at-rest storage for photos, signatures, and PII</li>
              <li>Signed, expiring URLs for uploaded files</li>
              <li>Automated encrypted database backups + tested restores</li>
              <li>Audit-log write on every mutation via database triggers</li>
            </ul>
            <Button size="sm" className="mt-2 bg-primary"><Database className="h-4 w-4 mr-1" />Enable Lovable Cloud</Button>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
