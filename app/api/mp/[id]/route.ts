import { tvfy } from "@/lib/tvfy";

type DivisionSummary = {
  id: number;
  date: string;
  house: string;
  name: string;
};

type DivisionDetail = DivisionSummary & {
  summary: string;
  // Each vote entry contains nested person information. The previous
  // implementation expected a flat `person_id` field which doesn't
  // exist in the API response, leading to no votes being matched for an
  // MP and an empty result set. Instead, each vote exposes a `person`
  // object with an `id` property. Model that structure so we can match
  // the selected MP correctly.
  votes: { person: { id: number }; vote: string }[];
};

type VoteResult = {
  id: number;
  date: string;
  house: string;
  name: string;
  summary: string;
  vote: string;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 2); // last ~60 days
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  const divisions = await tvfy<DivisionSummary[]>("/divisions.json", {
    start_date: toISO(start),
    end_date: toISO(today),
  });

  const results: VoteResult[] = [];
  for (const d of divisions) {
    const full = await tvfy<DivisionDetail>(`/divisions/${d.id}.json`);
    // Match the vote for the selected MP using the nested `person.id`
    // field. Previously we looked for a non-existent `person_id` field,
    // so no votes were ever found and the UI always displayed "No votes
    // in the recent window." for every MP.
    const vote = Array.isArray(full.votes)
      ? full.votes.find((v) => String(v.person?.id) === String(id))
      : undefined;
    if (vote) {
      results.push({
        id: d.id,
        date: d.date,
        house: d.house,
        name: d.name,
        summary: full.summary,
        vote: vote.vote, // 'aye' | 'no' | 'teller' | 'absent' etc.
      });
    }
  }
  return Response.json(results);
}