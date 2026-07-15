import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/common/PageHeader";
import { useCRM } from "@/store/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { initials } from "@/lib/format";
import { useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { Role, User } from "@/data/types";

export const Route = createFileRoute("/team")({ component: TeamPage });

const ROLES: Role[] = ["admin", "salesperson", "scheduler", "technician"];
const COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#eab308"];

type FormState = Omit<User, "id">;
const blank: FormState = { name: "", email: "", phone: "", role: "technician", avatarColor: COLORS[0], active: true };

function TeamPage() {
  const users = useCRM((s) => s.users);
  const addUser = useCRM((s) => s.addUser);
  const updateUser = useCRM((s) => s.updateUser);
  const removeUser = useCRM((s) => s.removeUser);
  const role = useCRM((s) => s.role);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(blank);

  const isAdmin = role === "admin";

  const openNew = () => { setEditing(null); setForm({ ...blank, avatarColor: COLORS[users.length % COLORS.length] }); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role, avatarColor: u.avatarColor, active: u.active }); setOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (editing) { updateUser(editing.id, form); toast.success("Team member updated"); }
    else { addUser(form); toast.success("Team member added"); }
    setOpen(false);
  };

  const remove = (u: User) => {
    if (!isAdmin) { toast.error("Only admins can remove team members"); return; }
    if (!confirm(`Remove ${u.name} from the team?`)) return;
    removeUser(u.id);
    toast.success("Team member removed");
  };

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Team"
        description={`${users.length} member${users.length === 1 ? "" : "s"}`}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary" onClick={openNew} disabled={!isAdmin} title={isAdmin ? "" : "Admin only"}>
                <UserPlus className="h-4 w-4 mr-1.5" /> Add member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit team member" : "Add team member"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
                  <div className="grid gap-1.5">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
                  <div className="grid gap-1.5">
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Avatar color</Label>
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, avatarColor: c })}
                          className={`h-7 w-7 rounded-full border-2 ${form.avatarColor === c ? "border-foreground" : "border-transparent"}`}
                          style={{ backgroundColor: c }} aria-label={c} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} id="active" />
                  <Label htmlFor="active" className="cursor-pointer">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editing ? "Save changes" : "Add member"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <Section>
        {!isAdmin && (
          <p className="text-xs text-muted-foreground mb-3">Switch to the Admin role in the top bar to add, edit, or remove team members.</p>
        )}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full grid place-items-center text-sm font-semibold text-white shrink-0" style={{ backgroundColor: u.avatarColor }}>{initials(u.name)}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {u.name}
                    {!u.active && <Badge variant="outline" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{u.phone}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(u)} disabled={!isAdmin} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(u)} disabled={!isAdmin} title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
