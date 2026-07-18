import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const KNOWN_TYPES = [
  "Passport",
  "Visa",
  "Emirates ID",
  "Trade License",
  "Chamber Certificate",
  "MOA",
  "Other",
] as const;

function computeStatus(expiry?: string | null): "Valid" | "Expiring" | "Expired" | null {
  if (!expiry) return null;
  const exp = new Date(expiry).getTime();
  if (Number.isNaN(exp)) return null;
  const now = Date.now();
  const days = (exp - now) / (1000 * 60 * 60 * 24);
  if (days < 0) return "Expired";
  if (days < 60) return "Expiring";
  return "Valid";
}

async function analyzeWithAI(args: {
  base64: string;
  mimeType: string;
  filename: string;
}): Promise<{
  doc_type: string;
  doc_number: string | null;
  holder_name: string | null;
  nationality: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  summary: string;
}> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI gateway not configured");

  const isPdf = args.mimeType === "application/pdf";
  const dataUrl = `data:${args.mimeType};base64,${args.base64}`;

  const systemPrompt = `You are a UAE PRO (Public Relations Officer) document assistant. You analyze uploaded corporate and personnel documents (Passports, Visas, Emirates IDs, Trade Licenses, Chamber Certificates, MOAs).

Return ONLY a JSON object with these keys (use null when unknown):
- doc_type: one of ${KNOWN_TYPES.join(", ")}
- doc_number: the primary identifier printed on the document
- holder_name: full name of the person, if a personnel document
- nationality: nationality of the holder, if applicable
- issue_date: YYYY-MM-DD
- expiry_date: YYYY-MM-DD
- summary: 1-2 sentence plain-English summary of what this document is and its key facts.

Do not include any text outside the JSON object.`;

  const userContent: Array<Record<string, unknown>> = [
    { type: "text", text: `Analyze this document (filename: ${args.filename}) and return the JSON described.` },
  ];
  if (isPdf) {
    userContent.push({ type: "file", file: { filename: args.filename, file_data: dataUrl } });
  } else {
    userContent.push({ type: "image_url", image_url: { url: dataUrl } });
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("AI rate limit. Please retry in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in Settings.");
    throw new Error(`AI analysis failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    // best effort
  }
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const docType = str(parsed.doc_type);
  return {
    doc_type: (KNOWN_TYPES as readonly string[]).includes(docType ?? "") ? (docType as string) : "Other",
    doc_number: str(parsed.doc_number),
    holder_name: str(parsed.holder_name),
    nationality: str(parsed.nationality),
    issue_date: str(parsed.issue_date),
    expiry_date: str(parsed.expiry_date),
    summary: str(parsed.summary) ?? "Document uploaded.",
  };
}

const UploadInput = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  base64: z.string().min(1),
  companyId: z.string().uuid().optional().nullable(),
  personnelId: z.string().uuid().optional().nullable(),
  scope: z.enum(["company", "personnel"]),
});

export const uploadAndAnalyzeDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1. Upload to storage
    const buffer = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const ext = data.filename.includes(".") ? data.filename.split(".").pop() : "bin";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("documents")
      .upload(path, buffer, { contentType: data.mimeType, upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    // 2. Insert placeholder row
    const { data: inserted, error: insErr } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        company_id: data.companyId ?? null,
        personnel_id: data.personnelId ?? null,
        scope: data.scope,
        storage_path: path,
        mime_type: data.mimeType,
        original_filename: data.filename,
        processing_status: "processing",
      })
      .select()
      .single();
    if (insErr) throw new Error(`DB insert failed: ${insErr.message}`);

    // 3. Analyze with AI
    try {
      const ai = await analyzeWithAI({
        base64: data.base64,
        mimeType: data.mimeType,
        filename: data.filename,
      });
      const status = computeStatus(ai.expiry_date);
      const { data: updated, error: updErr } = await supabase
        .from("documents")
        .update({
          doc_type: ai.doc_type,
          doc_number: ai.doc_number,
          holder_name: ai.holder_name,
          nationality: ai.nationality,
          issue_date: ai.issue_date,
          expiry_date: ai.expiry_date,
          status,
          summary: ai.summary,
          extracted: ai,
          processing_status: "ready",
          processing_error: null,
        })
        .eq("id", inserted.id)
        .select()
        .single();
      if (updErr) throw new Error(updErr.message);
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from("documents")
        .update({ processing_status: "failed", processing_error: message })
        .eq("id", inserted.id);
      throw new Error(message);
    }
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getDocumentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc, error } = await context.supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (error || !doc) throw new Error("Not found");
    const { data: signed, error: sErr } = await context.supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60 * 10);
    if (sErr) throw new Error(sErr.message);
    return { url: signed.signedUrl };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: doc } = await context.supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (doc?.storage_path) {
      await context.supabase.storage.from("documents").remove([doc.storage_path]);
    }
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
