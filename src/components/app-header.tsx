import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Search, ChevronRight } from "lucide-react";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { cn } from "@/lib/utils";

const breadcrumbLabels: Record<string, string> = {
  "/": "Dashboard",
  "/documents": "Documents",
  "/staff": "Staff",
  "/company-vault": "Company Vault",
  "/personnel-vault": "Personnel Vault",
  "/settings": "Settings",
  "/auth": "Sign in",
};

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = breadcrumbLabels[pathname] ?? "Overview";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Open menu"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground lg:hidden",
            "hover:bg-[color:var(--surface-hover)] hover:text-foreground",
          )}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="hidden sm:block">
          <WorkspaceSwitcher />
        </div>

        <div className="relative ml-auto hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            type="search"
            placeholder="Search clients, documents, or staff…"
            className={cn(
              "h-10 w-full min-w-[320px] rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25",
            )}
          />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <button
            type="button"
            aria-label="Notifications"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground",
              "transition-colors hover:border-[color:var(--gold)]/50 hover:text-foreground",
            )}
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[color:var(--danger)] px-1 text-[10px] font-bold text-white">
              4
            </span>
          </button>

          <button
            type="button"
            aria-label="Account menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[#B7791F] text-sm font-semibold text-background transition-transform hover:scale-105"
          >
            MS
          </button>
        </div>
      </div>

      <div className="flex h-10 items-center gap-2 border-t border-border/60 px-4 text-xs text-muted-foreground sm:px-6">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="font-medium text-foreground">{current}</span>
      </div>
    </header>
  );
}
