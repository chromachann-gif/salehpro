import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { personnel, companyById } from "@/lib/mock-data";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff · PRO Vault" },
      { name: "description", content: "Directory of personnel across every managed client company." },
    ],
  }),
  component: Staff,
});

function Staff() {
  return (
    <div className="space-y-6">
      <PageHeader title="Staff" subtitle={`${personnel.length} people across all clients`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {personnel.map((p) => {
          const co = companyById(p.company_id);
          return (
            <div key={p.id} className="card-elevated flex items-center gap-4 p-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--gold)] to-[#B7791F] text-base font-semibold text-background">
                {p.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">{p.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  <span aria-hidden>{p.flag}</span> {p.nationality}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{co?.name}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
