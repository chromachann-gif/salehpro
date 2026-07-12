import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Bell, Shield, User } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · PRO Vault" },
      { name: "description", content: "Workspace preferences, notifications, and account settings." },
    ],
  }),
  component: Settings,
});

const sections = [
  { icon: User, title: "Profile", desc: "Update your name, email, and avatar." },
  { icon: Bell, title: "Notifications", desc: "Choose when to be alerted about expiring documents." },
  { icon: Shield, title: "Security", desc: "Password, two-factor auth, and active sessions." },
];

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Workspace preferences and account controls" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card-elevated p-5">
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--gold)]/10">
              <Icon className="h-5 w-5 text-[color:var(--gold)]" strokeWidth={1.75} />
            </span>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
