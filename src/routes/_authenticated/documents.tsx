import { createFileRoute, useServerFn } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Upload, FileText, Trash2, Download, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatusDot } from "@/components/status-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  uploadAndAnalyzeDocument,
  listDocuments,
  getDocumentSignedUrl,
  deleteDocument,
} from "@/lib/documents.functions";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({
    meta: [
      { title: "Documents · PRO Vault" },
      { name: "description", content: "Upload documents to be automatically classified, extracted, and summarized by AI." },
    ],
  }),
  component: DocumentsPage,
});

type DocRow = {
  id: string;
  scope: "company" | "personnel";
  doc_type: string | null;
  doc_number: string | null;
  holder_name: string | null;
  nationality: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
  summary: string | null;
  original_filename: string | null;
  processing_status: string;
  processing_error: string | null;
  created_at: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DocumentsPage() {
  const qc = useQueryClient();
  const list = useServerFn(listDocuments);
  const upload = useServerFn(uploadAndAnalyzeDocument);
  const sign = useServerFn(getDocumentSignedUrl);
  const del = useServerFn(deleteDocument);
  const inputRef = useRef<HTMLInputElement>(null);
  const [scope, setScope] = useState<"company" | "personnel">("company");
  const [dragOver, setDragOver] = useState(false);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => list(),
  });

  const uploadMut = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} is over 20MB.`);
          continue;
        }
        const base64 = await fileToBase64(file);
        const t = toast.loading(`Analyzing ${file.name}…`);
        try {
          await upload({
            data: {
              filename: file.name,
              mimeType: file.type || "application/octet-stream",
              base64,
              scope,
            },
          });
          toast.success(`${file.name} classified & summarized.`, { id: t });
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Upload failed", { id: t });
        }
        qc.invalidateQueries({ queryKey: ["documents"] });
      }
    },
  });

  async function onOpen(id: string) {
    try {
      const { url } = await sign({ data: { id } });
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await del({ data: { id } });
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const rows = (docs ?? []) as DocRow[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        subtitle="Upload passports, visas, Emirates IDs, trade licenses — AI classifies and summarizes them automatically."
        actions={
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--gold)] px-4 text-sm font-semibold text-background shadow-[0_0_12px_rgba(212,168,83,0.25)] hover:brightness-110"
          >
            <Upload className="h-4 w-4" /> Upload
          </button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) uploadMut.mutate(files);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length) uploadMut.mutate(files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-[color:var(--gold)] bg-[color:var(--gold)]/5"
            : "border-border bg-card",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--gold)]/10">
          <Sparkles className="h-6 w-6 text-[color:var(--gold)]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Drop PDFs or images here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            AI will detect type, extract number & expiry, and write a summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["company", "personnel"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium capitalize transition-colors",
                scope === s
                  ? "border-[color:var(--gold)]/50 bg-[color:var(--gold)]/10 text-[color:var(--gold)]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="ml-2 h-8 rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground hover:border-[color:var(--gold)]/50"
          >
            Browse files
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="label-caption px-4 py-3">Document</th>
                <th className="label-caption px-4 py-3">Type</th>
                <th className="label-caption px-4 py-3">Number</th>
                <th className="label-caption px-4 py-3">Holder</th>
                <th className="label-caption px-4 py-3">Expiry</th>
                <th className="label-caption px-4 py-3">Status</th>
                <th className="label-caption px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No documents yet — upload one above.
                  </td>
                </tr>
              ) : (
                rows.map((d) => {
                  const tone =
                    d.status === "Valid"
                      ? "success"
                      : d.status === "Expiring"
                        ? "warning"
                        : d.status === "Expired"
                          ? "danger"
                          : "neutral";
                  return (
                    <tr key={d.id} className="border-b border-border/60 last:border-0 hover:bg-[color:var(--surface-hover)]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--gold)]/10 text-[color:var(--gold)]">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground" title={d.original_filename ?? ""}>
                              {d.original_filename ?? "Untitled"}
                            </p>
                            {d.summary && (
                              <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground" title={d.summary}>
                                {d.summary}
                              </p>
                            )}
                            {d.processing_status === "failed" && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-[color:var(--danger)]">
                                <AlertTriangle className="h-3 w-3" /> {d.processing_error}
                              </p>
                            )}
                            {d.processing_status === "processing" && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing…
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{d.doc_type ?? "—"}</td>
                      <td className="px-4 py-4 font-mono text-xs text-foreground">{d.doc_number ?? "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{d.holder_name ?? "—"}</td>
                      <td className="px-4 py-4 text-foreground">{formatDate(d.expiry_date)}</td>
                      <td className="px-4 py-4">
                        {d.status ? (
                          <span className="inline-flex items-center gap-2 text-sm">
                            <StatusDot tone={tone as "success" | "warning" | "danger" | "neutral"} />
                            {d.status}
                          </span>
                        ) : d.processing_status === "ready" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onOpen(d.id)}
                            aria-label="Open"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--gold)]/10 hover:text-[color:var(--gold)]"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(d.id)}
                            aria-label="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-[color:var(--danger)]/10 hover:text-[color:var(--danger)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
