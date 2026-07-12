import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BookUser,
  Plane,
  IdCard,
  FilePlus2,
  Upload,
  RefreshCw,
  Search,
  Download,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusDot } from "@/components/status-badge";
import {
  personnelDocuments,
  personnel,
  companyById,
  type PersonnelDocType,
  type DocStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personnel-vault")({
  head: () => ({
    meta: [
      { title: "Personnel Vault · PRO Vault" },
      {
        name: "description",
        content:
          "Track passports, visas, and Emirates IDs for every employee across all client companies.",
      },
    ],
  }),
  component: PersonnelVault,
});

const tabs: (PersonnelDocType | "All")[] = ["All", "Passport", "Visa", "Emirates ID"];

const typeMeta: Record<PersonnelDocType, { icon: typeof BookUser; color: string; bg: string }> = {
  Passport: { icon: BookUser, color: "text-sky-400", bg: "bg-sky-400/10" },
  Visa: { icon: Plane, color: "text-[color:var(--gold)]", bg: "bg-[color:var(--gold)]/10" },
  "Emirates ID": { icon: IdCard, color: "text-emerald-400", bg: "bg-emerald-400/10" },
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

function personById(id: string) {
  return personnel.find((p) => p.id === id);
}

function PersonnelVault() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return personnelDocuments
      .filter((d) => tab === "All" || d.type === tab)
      .filter((d) => {
        if (!q) return true;
        const p = personById(d.personnel_id);
        return (
          (p?.full_name.toLowerCase().includes(q) ?? false) ||
          d.number.toLowerCase().includes(q)
        );
      });
  }, [tab, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personnel Vault"
        subtitle={`${personnelDocuments.length} personnel documents`}
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color:var(--gold)]/50 px-4 text-sm font-semibold text-[color:var(--gold)] transition-all hover:bg-[color:var(--gold)]/10">
              <Upload className="h-4 w-4" /> Bulk Upload
            </button>
            <button
              disabled
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> Mark as Renewed
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-background shadow-[0_0_12px_rgba(212,168,83,0.25)] hover:brightness-110 active:scale-[0.98]">
              <FilePlus2 className="h-4 w-4" /> Add Document
            </button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by person or document number…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[color:var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/25"
          />
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-all",
                active
                  ? "border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                  : "border-border bg-card text-muted-foreground hover:border-[color:var(--gold)]/30 hover:text-foreground",
              )}
            >
              {t}
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
                <th className="label-caption px-4 py-3">Personnel</th>
                <th className="label-caption px-4 py-3">Company</th>
                <th className="label-caption px-4 py-3">Type</th>
                <th className="label-caption px-4 py-3">Number</th>
                <th className="label-caption px-4 py-3">Expiry</th>
                <th className="label-caption px-4 py-3">Status</th>
                <th className="label-caption px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const p = personById(d.personnel_id)!;
                const co = companyById(d.company_id);
                const meta = typeMeta[d.type];
                const Icon = meta.icon;
                const status = statusMap[d.status];
                return (
                  <tr
                    key={d.id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-[color:var(--surface-hover)]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[#B7791F] text-xs font-semibold text-background">
                          {p.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {p.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span aria-hidden>{p.flag}</span> {p.nationality}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{co?.name}</td>
                    <td className="px-4 py-4">
                      <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium", meta.bg, meta.color)}>
                        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} /> {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-foreground">{d.number}</td>
                    <td
                      className={cn(
                        "px-4 py-4",
                        d.status === "Expired" ? "text-[color:var(--danger)] line-through" : "text-foreground",
                      )}
                    >
                      {formatDate(d.expiry_date)}
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((d) => {
          const p = personById(d.personnel_id)!;
          const meta = typeMeta[d.type];
          const Icon = meta.icon;
          const status = statusMap[d.status];
          return (
            <div key={d.id} className="card-elevated p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[#B7791F] text-sm font-semibold text-background">
                  {p.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span aria-hidden>{p.flag}</span> {p.nationality} · {companyById(d.company_id)?.name}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <StatusDot tone={status.tone} />
                  {status.label}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", meta.bg, meta.color)}>
                  <Icon className="h-3.5 w-3.5" /> {d.type}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    d.status === "Expired" ? "text-[color:var(--danger)] line-through" : "text-foreground",
                  )}
                >
                  Exp {formatDate(d.expiry_date)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
