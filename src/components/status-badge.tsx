import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  success: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/25",
  warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)] border-[color:var(--warning)]/25",
  danger: "bg-[color:var(--danger)]/10 text-[color:var(--danger)] border-[color:var(--danger)]/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

const dotTone: Record<Tone, string> = {
  success: "bg-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]",
  danger: "bg-[color:var(--danger)]",
  neutral: "bg-muted-foreground",
};

export function StatusBadge({
  label,
  tone = "neutral",
  pulse = false,
  className,
}: {
  label: string;
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[11px] font-semibold uppercase tracking-wider",
        "transition-colors duration-200",
        tones[tone],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotTone[tone],
          pulse && "motion-safe:animate-pulse",
        )}
      />
      {label}
    </span>
  );
}

export function StatusDot({ tone }: { tone: Tone }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", dotTone[tone])} />;
}
