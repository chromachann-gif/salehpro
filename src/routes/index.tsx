import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  ArrowRight,
  Briefcase,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { companies, type Company, type CompanyStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Client Companies · PRO Vault" },
      {
        name: "description",
        content:
          "All registered corporate clients with license status, trade license expiry, and contact details at a glance.",
      },
    ],
  }),
  component: ClientsPage,
});

const statusToneMap: Record<CompanyStatus, "success" | "warning" | "danger"> = {
  Active: "success",
  Pending: "warning",
  Expired: "danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ClientsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.license_number.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Companies"
        subtitle={`${companies.length} registered clients`}
        actions={
          <button
            type="button"
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-background",
              "shadow-[0_0_12px_rgba(212,168,83,0.25)] transition-all duration-200",
              "hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,168,83,0.35)]",
              "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Add Company
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[400px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients by name, license, or email…"
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-card pl-10 pr-9 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25",
            )}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--surface-hover)] hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="ml-auto inline-flex overflow-hidden rounded-lg border border-border bg-card p-1">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "bg-[color:var(--surface-hover)] text-[color:var(--gold)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => setView("list")}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded-md transition-colors",
              view === "list"
                ? "bg-[color:var(--surface-hover)] text-[color:var(--gold)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((c, i) => (
            <CompanyRow key={c.id} company={c} divider={i < filtered.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <article
      className={cn(
        "group card-elevated relative p-5",
        "transition-all duration-200",
        "motion-safe:hover:-translate-y-0.5 hover:border-[color:var(--gold)]/40 hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]",
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--gold)]/25 to-[color:var(--gold)]/5 ring-1 ring-inset ring-[color:var(--gold)]/30">
          <Building2 className="h-6 w-6 text-[color:var(--gold)]" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              title={company.name}
              className="truncate text-[17px] font-semibold leading-tight text-foreground"
            >
              {company.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Company actions"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--surface-hover)] hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View Workspace</DropdownMenuItem>
                <DropdownMenuItem className="text-[color:var(--danger)] focus:text-[color:var(--danger)]">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-1.5">
            <StatusBadge label={company.status} tone={statusToneMap[company.status]} pulse={company.status === "Active"} />
          </div>
        </div>
      </div>

      <div className="my-4 h-px bg-border" />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        <MetaCell label="License No." value={company.license_number} />
        <MetaCell label="Phone" value={company.phone} />
        <MetaCell label="Email" value={company.email} />
        <MetaCell label="TL Expiry" value={formatDate(company.trade_license_expiry)} />
      </dl>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--gold)] transition-colors hover:brightness-110"
        >
          View workspace
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="label-caption">{label}</dt>
      <dd title={value} className="mt-0.5 truncate text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function CompanyRow({ company, divider }: { company: Company; divider: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-[color:var(--surface-hover)]",
        divider && "border-b border-border",
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--gold)]/10">
        <Building2 className="h-5 w-5 text-[color:var(--gold)]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
          <StatusBadge label={company.status} tone={statusToneMap[company.status]} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {company.license_number} · {company.email} · TL expires {formatDate(company.trade_license_expiry)}
        </p>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--gold)] hover:brightness-110"
      >
        Open <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card-elevated flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Briefcase className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">No clients yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your first company to start tracking trade licenses and personnel documents.
      </p>
      <button
        type="button"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-background hover:brightness-110"
      >
        <Plus className="h-4 w-4" /> Add Company
      </button>
    </div>
  );
}
