import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="border-b border-border bg-gradient-soft">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            {eyebrow && <div className="text-xs font-medium uppercase tracking-wider text-accent-foreground/70">{eyebrow}</div>}
            <h1 className="truncate text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 sm:px-6 lg:px-8 py-6 ${className}`}>{children}</div>;
}
