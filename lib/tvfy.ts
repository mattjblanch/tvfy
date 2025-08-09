const TVFY = "https://theyvoteforyou.org.au/api/v1";

type Params = Record<string, string | number | boolean | undefined>;

// Optional debug entry describing a TVFY API call
type DebugEntry = { request: string; response: unknown };

export async function tvfy<T>(
  path: string,
  params: Params = {},
  debug?: DebugEntry[],
) {
  const qs = new URLSearchParams({ key: process.env.TVFY_API_KEY! });
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, String(v));
  const url = `${TVFY}${path}?${qs}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();
  if (debug) debug.push({ request: url, response: json });
  if (!res.ok) throw new Error(`TVFY ${res.status}`);
  return json as T;
}