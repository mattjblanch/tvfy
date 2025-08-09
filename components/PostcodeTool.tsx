"use client";

import { useState } from "react";

type OARepresentative = {
  member_id: string;
  person_id: string;
  name: string;
  party: string;
  constituency: string;
};

type VoteRow = {
  id: number;
  date: string;
  house: string;
  name: string;
  summary: string;
  vote: string;
};

export default function PostcodeTool() {
  const [postcode, setPostcode] = useState("");
  const [reps, setReps] = useState<OARepresentative[] | null>(null);
  const [selected, setSelected] = useState<OARepresentative | null>(null);
  const [votes, setVotes] = useState<VoteRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup() {
    setError(null);
    setVotes(null);
    setSelected(null);
    setReps(null);
    if (!postcode.trim()) return;
    setLoading(true);
      try {
        const r = await fetch(`/api/lookup?postcode=${encodeURIComponent(postcode.trim())}`);
        if (!r.ok) throw new Error(`Lookup failed (${r.status})`);
        const data = (await r.json()) as OARepresentative[];
        setReps(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lookup failed");
      } finally {
        setLoading(false);
      }
    }

  async function choose(rep: OARepresentative) {
    setSelected(rep);
    setVotes(null);
    setError(null);
    setLoading(true);
    try {
      const id = Number(rep.person_id);
      const vv = await fetch(`/api/mp/${id}/votes`);
      if (!vv.ok) throw new Error("Could not load votes");
      const votes = (await vv.json()) as VoteRow[];
      setVotes(votes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8">
      <div className="rounded-xl border bg-white p-4">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="e.g. 3000"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
          />
          <button
            onClick={lookup}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          >
            {loading ? "Loading…" : "Find MP"}
          </button>
        </div>
        {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      </div>

      {reps && reps.length > 0 && !selected && (
        <div className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="text-lg font-medium">Select your electorate</h2>
          <p className="text-sm text-gray-600 mb-3">
            Postcodes can map to multiple electorates; choose the one that applies.
          </p>
          <ul className="divide-y">
            {reps.map((r) => (
              <li key={r.person_id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name} — {r.party}</div>
                  <div className="text-sm text-gray-600">{r.constituency}</div>
                </div>
                <button
                  onClick={() => choose(r)}
                  className="px-3 py-2 rounded-lg border"
                >
                  Choose
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected && (
        <div className="mt-6 rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent votes — {selected.name} ({selected.constituency})</h2>
            <button onClick={() => { setSelected(null); setVotes(null); }} className="text-sm underline">
              Change electorate
            </button>
          </div>

          {!votes && <p className="mt-3 text-gray-600 text-sm">Loading votes…</p>}

          {votes && votes.length === 0 && (
            <p className="mt-3 text-gray-600 text-sm">No votes in the recent window.</p>
          )}

          {votes && votes.length > 0 && (
            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">House</th>
                    <th className="text-left px-3 py-2">Division</th>
                    <th className="text-left px-3 py-2">Vote</th>
                  </tr>
                </thead>
                <tbody>
                  {votes.map((v) => (
                    <tr key={v.id} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-2 align-top">
                        {new Date(v.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 align-top capitalize">{v.house}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-gray-600 line-clamp-3">{v.summary}</div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                          {v.vote}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}