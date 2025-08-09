const TVFY = "https://theyvoteforyou.org.au/api/v1";

type Params = Record<string, string | number | boolean | undefined>;

export async function tvfy<T>(path: string, params: Params = {}) {
  const qs = new URLSearchParams({ key: process.env.TVFY_API_KEY! });
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, String(v));
  const res = await fetch(`${TVFY}${path}?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`TVFY ${res.status}`);
  return res.json() as Promise<T>;
}