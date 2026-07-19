import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Send, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";

const reviews = [
  { id: "r1", customer: "Jamie Cole", stars: 5, source: "Google", text: "Softener install was quick and clean. Water tastes amazing!", date: "2026-07-12" },
  { id: "r2", customer: "T. Nguyen", stars: 5, source: "Facebook", text: "Great team, on time, and no mess.", date: "2026-07-05" },
  { id: "r3", customer: "R. Patel", stars: 4, source: "Google", text: "Solid service, would recommend.", date: "2026-06-28" },
];
const campaigns = [
  { id: "c1", name: "Spring maintenance reminder", type: "Email", sent: 412, opened: 231, booked: 34, status: "Live" },
  { id: "c2", name: "Referral push — July", type: "SMS", sent: 180, opened: 168, booked: 12, status: "Live" },
  { id: "c3", name: "RO drinking upsell", type: "Email", sent: 0, opened: 0, booked: 0, status: "Draft" },
];
const showcase = [
  { id: "s1", title: "Whole-home softener + RO in Alamo Heights", photos: 6 },
  { id: "s2", title: "Iron filter retrofit — Boerne", photos: 4 },
  { id: "s3", title: "Under-sink RO drinking system", photos: 3 },
];

export const Route = createFileRoute("/marketing")({ component: MarketingPage });

function MarketingPage() {
  return (
    <>
      <PageHeader eyebrow="Growth" title="Marketing" description="Reviews, campaigns, job showcase, and social" />
      <Section>
        <Tabs defaultValue="reviews">
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="showcase">Job Showcase</TabsTrigger>
            <TabsTrigger value="social">Social Posting</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">4.9</div>
              <div><div className="flex text-amber-500">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div><div className="text-xs text-muted-foreground">147 reviews across Google & Facebook</div></div>
              <Button size="sm" className="ml-auto" onClick={() => toast.success("Review request sent to recent customers")}><Send className="h-3 w-3 mr-1" />Request reviews</Button>
            </div>
            <div className="grid gap-2">
              {reviews.map(r => (
                <Card key={r.id}><CardContent className="p-4">
                  <div className="flex items-center gap-2"><div className="font-medium">{r.customer}</div><Badge variant="outline">{r.source}</Badge><div className="flex text-amber-500">{Array.from({length:r.stars}).map((_,i)=><Star key={i} className="h-3 w-3 fill-current" />)}</div><div className="text-xs text-muted-foreground ml-auto">{r.date}</div></div>
                  <div className="text-sm mt-1">"{r.text}"</div>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="mt-4 space-y-3">
            {campaigns.map(c => (
              <Card key={c.id}><CardContent className="p-4 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><div className="font-medium">{c.name}</div><Badge variant="outline">{c.type}</Badge><Badge variant={c.status === "Live" ? "default" : "secondary"}>{c.status}</Badge></div>
                  <div className="text-xs text-muted-foreground mt-1">Sent {c.sent} · Opened {c.opened} · Bookings {c.booked}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${c.name} launched`)}>{c.status === "Live" ? "View report" : "Launch"}</Button>
              </CardContent></Card>
            ))}
          </TabsContent>

          <TabsContent value="showcase" className="mt-4 grid gap-3 sm:grid-cols-3">
            {showcase.map(s => (
              <Card key={s.id}><CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent grid place-items-center text-primary"><Sparkles className="h-8 w-8" /></div>
                <div className="p-3"><div className="font-medium text-sm">{s.title}</div><div className="text-xs text-muted-foreground">{s.photos} photos · publish-ready</div></div>
              </CardContent></Card>
            ))}
          </TabsContent>

          <TabsContent value="social" className="mt-4 space-y-3">
            <Card><CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold"><Share2 className="h-4 w-4" />AI-drafted post</div>
              <div className="text-sm bg-muted/50 p-3 rounded-lg">"Fresh softener install in Alamo Heights today 💧 Cleaner water, longer-lasting appliances. Book a free water test this week!"</div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success("Posted to Facebook, Instagram, Google Business")}>Post to all channels</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Regenerated")}>Regenerate</Button>
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}
