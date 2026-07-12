import { useState } from "react";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Portfolio = { id: string; name: string; count: number };

const PORTFOLIOS: Portfolio[] = [
  { id: "all", name: "All Clients", count: 3 },
  { id: "trading", name: "Trading Portfolio", count: 1 },
  { id: "contracting", name: "Contracting Portfolio", count: 1 },
  { id: "logistics", name: "Logistics Portfolio", count: 1 },
];

export function WorkspaceSwitcher() {
  const [selected, setSelected] = useState(PORTFOLIOS[0]);
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch workspace"
          className={cn(
            "group relative inline-flex h-9 items-center gap-2 rounded-full",
            "border border-[color:var(--gold)]/60 px-4 py-1.5",
            "bg-gradient-to-r from-[color:var(--surface)] to-[color:var(--surface-hover)]",
            "shadow-[0_0_8px_rgba(212,168,83,0.15)]",
            "transition-all duration-200 ease-out",
            "hover:border-[color:var(--gold)]/90 hover:shadow-[0_0_16px_rgba(212,168,83,0.28)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "w-fit min-w-[180px] max-w-[260px]",
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--gold)]/10">
            <Building2 className="h-3.5 w-3.5 text-[color:var(--gold)]" strokeWidth={1.75} />
          </span>
          <span className="block min-w-0 flex-1 overflow-hidden text-left text-sm font-medium text-foreground transition-transform duration-200 group-hover:translate-x-0.5">
            <span className="block truncate">{selected.name}</span>
          </span>
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200",
              "group-hover:text-[color:var(--gold)]",
              open && "rotate-180 text-[color:var(--gold)]",
            )}
            strokeWidth={1.75}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="min-w-[240px] rounded-xl border-border bg-card p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      >
        {PORTFOLIOS.map((p) => {
          const active = p.id === selected.id;
          return (
            <DropdownMenuItem
              key={p.id}
              onClick={() => setSelected(p)}
              className={cn(
                "flex h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2",
                "border-l-2 border-transparent",
                "focus:bg-[color:var(--surface-hover)]",
                active && "border-l-[color:var(--gold)] bg-[color:var(--surface-hover)]",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                  active ? "bg-[color:var(--gold)]/15" : "bg-muted",
                )}
              >
                <Building2
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-[color:var(--gold)]" : "text-muted-foreground",
                  )}
                  strokeWidth={1.75}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span
                  className={cn(
                    "truncate text-sm font-medium",
                    active ? "text-[color:var(--gold)]" : "text-foreground",
                  )}
                >
                  {p.name}
                </span>
                <span className="text-xs text-muted-foreground">{p.count} clients</span>
              </span>
              {active && <Check className="h-4 w-4 text-[color:var(--gold)]" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="my-2 bg-border" />
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-[color:var(--gold)]/40 px-3 py-2",
            "text-sm font-medium text-[color:var(--gold)]",
            "transition-colors duration-200 hover:bg-[color:var(--gold)]/10",
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Portfolio
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
