export const OPENCODE_BASE = "https://superagent-2b61d5b9.base44.app/functions";
export const DEFAULT_MODEL = "beam-free";

export type ModelInfo = { id: string; name: string; reasoning?: boolean };

export const SYSTEM_PROMPT = `You are an expert UI engineer inside a v0-style generator. You build beautiful, production-quality React components with Tailwind CSS and lucide-react icons.

Rules:
- First write 1-3 short sentences (in the user's language) describing what you built or changed.
- Then output EXACTLY ONE fenced code block with language tag tsx containing the COMPLETE file App.tsx.
- The file must \`export default function App()\`.
- Only import from "react" and "lucide-react". No other packages, no CSS imports, no images except https URLs (e.g. https://images.unsplash.com/...).
- Style only with Tailwind utility classes. Make it polished, responsive, with realistic content and interactivity via React state.
- When asked to modify, always return the full updated file, never a diff.`;

export async function fetchModels(): Promise<ModelInfo[]> {
  const r = await fetch(`${OPENCODE_BASE}/opencodeFreeModels`);
  if (!r.ok) throw new Error("models");
  const d = await r.json();
  return (d.models ?? []) as ModelInfo[];
}

export type ChatResult = { content: string; reasoning?: string; usage?: { total_tokens?: number }; model?: string };

export async function sendChat(opts: { prompt: string; session: string; model: string; signal?: AbortSignal }): Promise<ChatResult> {
  const body = { prompt: opts.prompt, session: opts.session, model: opts.model, system: SYSTEM_PROMPT };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${OPENCODE_BASE}/opencodeChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attempt > 0 && res502 ? { ...body, model: DEFAULT_MODEL } : body),
      signal: opts.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.content !== undefined) return data as ChatResult;
    if (res.status === 502) { res502 = true; continue; }
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * (attempt + 1))); continue; }
    throw new Error(data.error || data.message || `خطأ ${res.status}`);
  }
  throw new Error("تعذر الحصول على رد من النموذج، حاول مرة أخرى.");
}
let res502 = false;

export async function clearSession(session: string) {
  await fetch(`${OPENCODE_BASE}/opencodeSessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "clear", session }),
  }).catch(() => {});
}

/** Splits AI content into prose and the tsx code (if any). */
export function extractCode(content: string): { text: string; code: string | null } {
  const m = content.match(/```(?:tsx|jsx|typescript|ts|javascript|js|react)?\s*\n([\s\S]*?)```/);
  if (!m) return { text: content.trim(), code: null };
  const text = content.replace(m[0], "").trim();
  return { text, code: m[1].trim() };
}
