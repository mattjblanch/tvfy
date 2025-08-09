import { tvfy } from "@/lib/tvfy";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 2); // last ~60 days
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  const divisions = await tvfy<any[]>("/divisions.json", {
    start_date: toISO(start),
    end_date: toISO(today),
  });

  const results: any[] = [];
  for (const d of divisions) {
    const full = await tvfy<any>(`/divisions/${d.id}.json`);
    const vote = Array.isArray(full.votes)
      ? full.votes.find((v: any) => String(v.person_id) === String(id))
      : null;
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