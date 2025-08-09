import { tvfy } from "@/lib/tvfy";

type DivisionSummary = {
  id: number;
  date: string;
  house: string;
  name: string;
};

type DivisionDetail = DivisionSummary & {
  summary: string;
  votes: { person_id: number; vote: string }[];
};

type VoteResult = {
  id: number;
  date: string;
  house: string;
  name: string;
  summary: string;
  vote: string;
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
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
    const vote = Array.isArray(full.votes)
      ? full.votes.find((v) => String(v.person_id) === String(id))
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