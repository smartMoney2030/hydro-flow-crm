import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Droplet, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const navigate = useNavigate();
  const [forgot, setForgot] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-hero text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-white/20"><Droplet className="h-5 w-5" /></div>
            <div className="font-semibold text-lg">My Water People CRM</div>
          </div>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Cleaner water. Cleaner operations.</h1>
          <p className="text-white/80 max-w-md">Sales pipeline, installation scheduling, and annual maintenance in one workspace built for water-treatment teams.</p>
        </div>
        <div className="relative text-xs text-white/60 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Production deployments enforce server-side auth, RLS, and encrypted storage.</div>
      </div>

      <div className="flex items-center justify-center p-6 bg-gradient-soft">
        <Card className="w-full max-w-md shadow-wave">
          <CardContent className="p-8 space-y-5">
            <div>
              <h2 className="text-2xl font-bold">{forgot ? "Reset password" : "Sign in"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{forgot ? "We'll email you a reset link." : "Use any credentials — this is a demo build."}</p>
            </div>
            <div className="space-y-3">
              <div><Label>Email</Label><Input placeholder="you@mywaterpeople.com" defaultValue="alex@mywaterpeople.com" /></div>
              {!forgot && <div><Label>Password</Label><Input type="password" placeholder="••••••••" defaultValue="demo" /></div>}
              <Button className="w-full bg-primary" onClick={() => navigate({ to: "/" })}>
                {forgot ? "Send reset link" : "Sign in"}
              </Button>
              <button onClick={() => setForgot((f) => !f)} className="text-xs text-primary hover:underline">
                {forgot ? "← Back to sign in" : "Forgot password?"}
              </button>
            </div>
            <div className="pt-4 border-t text-xs text-muted-foreground">
              After sign-in, use the role switcher in the top bar to preview the app as Admin, Salesperson, Scheduler, or Technician.
              <div className="mt-2">
                <Link to="/technician" className="text-primary hover:underline">Open Technician mobile →</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
