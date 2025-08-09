import { tvfy } from "@/lib/tvfy";

type TVFYPerson = {
  id: number;
  name: string;
  electorate: string | null;
  house: "representatives" | "senate";
};

const norm = (s: string) =>
  s.normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export async function POST(req: Request) {
  const { name, electorate } = (await req.json()) as { name?: string; electorate?: string };
  if (!name || !electorate) return new Response("name + electorate required", { status: 400 });

  const people = await tvfy<TVFYPerson[]>("/people.json");

  // Electorate-first match; senators have null electorates
  const byElec = people.filter(
    (p) => p.electorate && norm(p.electorate) === norm(electorate)
  );

  if (byElec.length === 1) {
    return Response.json({ id: byElec[0].id, person: byElec[0] });
  }

  // Tie-breaker on last name (very rare edge cases)
  const last = norm(name).split(" ").at(-1)!;
  const tie = byElec.find((p) => norm(p.name).includes(last));
  if (tie) return Response.json({ id: tie.id, person: tie });

  return new Response("not found", { status: 404 });
}
