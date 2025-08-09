const OA = "https://www.openaustralia.org.au/api";

type Params = Record<string, string | number | boolean | undefined>;

export async function oa<T>(fn: string, params: Params = {}) {
  const qs = new URLSearchParams({
    key: process.env.OA_API_KEY!,
    output: "js",
  });
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, String(v));
  const res = await fetch(`${OA}/${fn}?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`OpenAustralia ${res.status}`);
  return res.json() as Promise<T>;
}