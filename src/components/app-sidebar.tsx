import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  UserCircle2,
  Building2,
  IdCard,
  Settings,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: "/" | "/staff" | "/company-vault" | "/personnel-vault" | "/documents" | "/settings";
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const nav: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Documents", to: "/documents", icon: FileText },
  { label: "Staff", to: "/staff", icon: UserCircle2 },
  { label: "Company Vault", to: "/company-vault", icon: Building2 },
  { label: "Personnel Vault", to: "/personnel-vault", icon: IdCard },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col border-r border-border bg-sidebar",
        "lg:flex",
      )}
    >
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color:var(--gold)]/10">
          <ShieldCheck className="h-5 w-5 text-[color:var(--gold)]" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-foreground">PRO Vault</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            UAE Services
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map(({ label, to, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={label}
                to={to}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium",
                  "transition-colors duration-200",
                  active
                    ? "bg-[color:var(--surface-hover)] text-foreground"
                    : "text-muted-foreground hover:bg-[color:var(--surface-hover)]/60 hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[color:var(--gold)]" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-[color:var(--gold)]" : "text-muted-foreground opacity-70",
                  )}
                  strokeWidth={1.75}
                />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="rounded-lg border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--gold)]">
            Renewal window
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            4 documents expire in the next 90 days.
          </p>
        </div>
      </div>
    </aside>
  );
}
