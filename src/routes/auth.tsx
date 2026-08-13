import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logoAsset from "@/assets/my-water-people-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · My Water People CRM" },
      { name: "description", content: "Sign in to the My Water People CRM to manage leads, installations, and annual maintenance." },
      { property: "og:title", content: "Sign in · My Water People CRM" },
      { property: "og:description", content: "Sign in to the My Water People CRM to manage leads, installations, and annual maintenance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Reset link sent — check your inbox.");
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
        navigate({ to: "/" });
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-gradient-hero text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl grid place-items-center bg-white overflow-hidden">
              <img src={logoAsset.url} alt="My Water People" className="h-11 w-11 object-contain" />
            </div>
            <div className="font-semibold text-lg">My Water People CRM</div>
          </div>
        </div>
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold leading-tight">Cleaner water. Cleaner operations.</h1>
          <p className="text-white/80 max-w-md">Sales pipeline, installation scheduling, and annual maintenance in one workspace built for water-treatment teams.</p>
        </div>
        <div className="relative text-xs text-white/60 flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Your CRM data is stored in the cloud database with row-level security.</div>
      </div>

      <div className="flex items-center justify-center p-6 bg-gradient-soft">
        <Card className="w-full max-w-md shadow-wave">
          <CardContent className="p-8 space-y-5">
            <div>
              <h2 className="text-2xl font-bold">
                {mode === "forgot" ? "Reset password" : mode === "signup" ? "Create account" : "Sign in"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "forgot"
                  ? "We'll email you a reset link."
                  : "Sign in to load your customers, jobs, and maintenance schedule."}
              </p>
            </div>

            <div className="space-y-3">
              {mode === "signup" && (
                <div>
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
                </div>
              )}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mywaterpeople.com"
                />
              </div>
              {mode !== "forgot" && (
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}
              <Button className="w-full bg-primary" onClick={submit} disabled={busy || !email}>
                {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {mode === "forgot" ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
              </Button>

              {mode !== "forgot" && (
                <>
                  <div className="relative py-1 text-center text-xs text-muted-foreground">
                    <span className="bg-card px-2 relative z-10">or</span>
                    <div className="absolute inset-x-0 top-1/2 border-t" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={google} disabled={busy}>
                    Continue with Google
                  </Button>
                </>
              )}

              <div className="flex items-center justify-between text-xs">
                <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary hover:underline">
                  {mode === "signup" ? "← Have an account? Sign in" : "Create an account"}
                </button>
                <button onClick={() => setMode(mode === "forgot" ? "signin" : "forgot")} className="text-primary hover:underline">
                  {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
                </button>
              </div>
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
