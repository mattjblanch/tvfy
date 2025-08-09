import { oa } from "@/lib/oa";

// Minimal typing for OA getRepresentatives "output=js"
export type OARepresentative = {
  member_id: string;
  person_id: string;
  name: string;
  party: string;
  constituency: string; // electorate name
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const postcode = url.searchParams.get("postcode");
  if (!postcode) return new Response("postcode required", { status: 400 });

  const reps = await oa<OARepresentative[]>("getRepresentatives", { postcode });
  return Response.json(reps);
}