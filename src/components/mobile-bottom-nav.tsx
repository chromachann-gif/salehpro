import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, UserCircle2, Building2, IdCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  label: string;
  to: "/" | "/staff" | "/company-vault" | "/personnel-vault" | "/settings";
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const items: Item[] = [
  { label: "Home", to: "/", icon: LayoutDashboard, exact: true },
  { label: "Staff", to: "/staff", icon: UserCircle2 },
  { label: "Company", to: "/company-vault", icon: Building2 },
  { label: "Personnel", to: "/personnel-vault", icon: IdCard },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      aria-label="Primary"
    >
      {items.map(({ label, to, icon: Icon, exact }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={label}
            to={to}
            className={cn(
              "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
              active ? "text-[color:var(--gold)]" : "text-muted-foreground",
            )}
          >
            <Icon
              className="h-5 w-5"
              strokeWidth={active ? 2.25 : 1.75}
              fill={active ? "currentColor" : "none"}
              fillOpacity={active ? 0.15 : 0}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
