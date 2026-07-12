import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FileText,
  Landmark,
  ScrollText,
  FilePlus2,
  Upload,
  RefreshCw,
  Download,
  Pencil,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusDot } from "@/components/status-badge";
import {
  companyDocuments,
  companyById,
  type CompanyDocument,
  type CompanyDocType,
  type DocStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/company-vault")({
  head: () => ({
    meta: [
      { title: "Company Vault · PRO Vault" },
      {
        name: "description",
        content:
          "All corporate documents in one vault: trade licenses, chamber certificates, MOA and more with live expiry status.",
      },
    ],
  }),
  component: CompanyVault,
});

const filters: (CompanyDocType | "All")[] = [
  "All",
  "Trade License",
  "Chamber Certificate",
  "MOA",
  "Other",
];

const typeIcon: Record<CompanyDocType, { icon: typeof FileText; color: string }> = {
  "Trade License": { icon: FileText, color: "text-[color:var(--gold)]" },
  "Chamber Certificate": { icon: Landmark, color: "text-sky-400" },
  MOA: { icon: ScrollText, color: "text-emerald-400" },
  Other: { icon: FilePlus2, color: "text-muted-foreground" },
};

const statusMap: Record<DocStatus, { tone: "success" | "warning" | "danger"; label: string }> = {
  Valid: { tone: "success", label: "Valid" },
  Expiring: { tone: "warning", label: "Expiring Soon" },
  Expired: { tone: "danger", label: "Expired" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CompanyVault() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companyDocuments
      .filter((d) => filter === "All" || d.type === filter)
      .filter((d) => {
        if (!q) return true;
        const co = companyById(d.company_id)?.name.toLowerCase() ?? "";
        return co.includes(q) || d.number.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const cmp = a.expiry_date.localeCompare(b.expiry_date);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [filter, query, sortDir]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Vault"
        subtitle={`${companyDocuments.length} company documents`}
        actions={
          <>
            <button
              type="button"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg border border-[color:var(--gold)]/50 px-4 text-sm font-semibold text-[color:var(--gold)]",
                "transition-all duration-200 hover:bg-[color:var(--gold)]/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Bulk Upload
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground",
                "transition-all duration-200",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "enabled:hover:border-[color:var(--gold)]/50 enabled:hover:text-[color:var(--gold)]",
              )}
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
              Mark as Renewed {selected.size > 0 && `(${selected.size})`}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-background shadow-[0_0_12px_rgba(212,168,83,0.25)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <FilePlus2 className="h-4 w-4" strokeWidth={2} />
              Add Document
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name or document number…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25"
          />
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-all",
                active
                  ? "border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                  : "border-border bg-card text-muted-foreground hover:border-[color:var(--gold)]/30 hover:text-foreground",
              )}
            >
              {f === "All" ? "All Documents" : f}
            </button>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    className="h-4 w-4 accent-[color:var(--gold)]"
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(rows.map((r) => r.id)));
                      else setSelected(new Set());
                    }}
                    checked={selected.size === rows.length && rows.length > 0}
                  />
                </th>
                <th className="label-caption px-4 py-3">Company</th>
                <th className="label-caption px-4 py-3">Type</th>
                <th className="label-caption px-4 py-3">Number</th>
                <th className="label-caption px-4 py-3">Issued</th>
                <th className="label-caption px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    Expiry
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="label-caption px-4 py-3">Status</th>
                <th className="label-caption px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <DocRow
                  key={r.id}
                  doc={r}
                  selected={selected.has(r.id)}
                  onToggle={() => toggle(r.id)}
                />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No documents match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-medium text-foreground">{rows.length}</span> of{" "}
            {companyDocuments.length}
          </span>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground">
              <option>10 / page</option>
              <option>25 / page</option>
              <option>50 / page</option>
            </select>
            <button className="h-8 rounded-md border border-border px-2 hover:text-foreground">
              Prev
            </button>
            <span className="text-foreground">1</span>
            <button className="h-8 rounded-md border border-border px-2 hover:text-foreground">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((d) => {
          const Icon = typeIcon[d.type].icon;
          const status = statusMap[d.status];
          const company = companyById(d.company_id);
          return (
            <div key={d.id} className="card-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{company?.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className={cn("h-4 w-4", typeIcon[d.type].color)} strokeWidth={1.75} />
                    <span>{d.type}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <StatusDot tone={status.tone} />
                  {status.label}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <div>
                  <dt className="label-caption">Number</dt>
                  <dd className="text-xs font-medium text-foreground">{d.number}</dd>
                </div>
                <div>
                  <dt className="label-caption">Expiry</dt>
                  <dd
                    className={cn(
                      "text-xs font-medium",
                      d.status === "Expired" ? "text-[color:var(--danger)] line-through" : "text-foreground",
                    )}
                  >
                    {formatDate(d.expiry_date)}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocRow({
  doc,
  selected,
  onToggle,
}: {
  doc: CompanyDocument;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = typeIcon[doc.type].icon;
  const company = companyById(doc.company_id);
  const status = statusMap[doc.status];
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-[color:var(--surface-hover)] last:border-0">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${company?.name}`}
          className="h-4 w-4 accent-[color:var(--gold)]"
        />
      </td>
      <td className="px-4 py-4">
        <p className="truncate font-semibold text-foreground">{company?.name}</p>
        <p className="text-xs text-muted-foreground">{company?.license_number}</p>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-2 text-foreground">
          <Icon className={cn("h-4 w-4", typeIcon[doc.type].color)} strokeWidth={1.75} />
          <span className="text-sm">{doc.type}</span>
        </span>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-foreground">{doc.number}</td>
      <td className="px-4 py-4 text-muted-foreground">{formatDate(doc.issue_date)}</td>
      <td
        className={cn(
          "px-4 py-4",
          doc.status === "Expired" ? "text-[color:var(--danger)] line-through" : "text-foreground",
        )}
      >
        {formatDate(doc.expiry_date)}
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
          <StatusDot tone={status.tone} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-1">
          <button
            aria-label="Download"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--gold)]/10 hover:text-[color:var(--gold)]"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            aria-label="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--gold)]/10 hover:text-[color:var(--gold)]"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}
