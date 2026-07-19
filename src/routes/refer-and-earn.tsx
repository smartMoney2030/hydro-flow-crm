import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Gift, Share2 } from "lucide-react";

const referrals = [
  { id: "r1", referrer: "Jamie Cole", referred: "N. Chavez", status: "Installed", reward: 100, date: "2026-07-08" },
  { id: "r2", referrer: "T. Nguyen", referred: "B. Hall", status: "Quoted", reward: 0, date: "2026-07-12" },
  { id: "r3", referrer: "R. Patel", referred: "S. Kim", status: "New lead", reward: 0, date: "2026-07-16" },
];

export const Route = createFileRoute("/refer-and-earn")({ component: ReferEarnPage });

function ReferEarnPage() {
  const link = "https://mywaterpeople.com/r/JAMIE-100";
  return (
    <>
      <PageHeader eyebrow="Growth" title="Refer & Earn" description="Reward customers for sending new business" />
      <Section className="space-y-4">
        <Card><CardContent className="p-4 flex flex-wrap items-center gap-4">
          <Gift className="h-8 w-8 text-primary" />
          <div className="flex-1 min-w-[240px]">
            <div className="font-semibold">$100 for every install</div>
            <div className="text-xs text-muted-foreground">Customers earn a $100 credit (or check) when a referral completes an install. Referred customer gets $50 off.</div>
          </div>
          <div className="flex gap-2 items-center">
            <Input readOnly value={link} className="w-72" />
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(link); toast.success("Referral link copied"); }}><Share2 className="h-3 w-3 mr-1" />Share</Button>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-0 divide-y">
          {referrals.map(r => (
            <div key={r.id} className="p-3 flex items-center gap-3">
              <div className="flex-1"><div className="font-medium text-sm">{r.referrer} → {r.referred}</div><div className="text-xs text-muted-foreground">{r.date}</div></div>
              <Badge variant="outline">{r.status}</Badge>
              <div className="w-20 text-right font-semibold">{r.reward ? `$${r.reward}` : "—"}</div>
            </div>
          ))}
        </CardContent></Card>
      </Section>
    </>
  );
}
