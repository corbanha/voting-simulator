import type { Voter, Candidate, ElectionResult } from '../types';
import { buildScoreBallot } from './ballotBuilder';

export function runSTAR(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const ballots = voters.map(v =>
    buildScoreBallot(v, candidates, candidatesPerParty),
  );

  // Stage 1: Score totals
  const totals: Record<string, number> = {};
  for (const c of candidates) totals[c.id] = 0;
  for (const ballot of ballots) {
    for (const [id, score] of Object.entries(ballot)) {
      totals[id] = (totals[id] ?? 0) + score;
    }
  }

  // Top 2 by score total
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const top2 = [sorted[0]![0], sorted[1]!?.[0] ?? sorted[0]![0]];

  // Stage 2: Automatic runoff between top 2
  const runoff: Record<string, number> = { [top2[0]!]: 0, [top2[1]!]: 0 };
  for (const ballot of ballots) {
    const scoreA = ballot[top2[0]!] ?? 0;
    const scoreB = ballot[top2[1]!] ?? 0;
    if (scoreA > scoreB) runoff[top2[0]!] = (runoff[top2[0]!] ?? 0) + 1;
    else if (scoreB > scoreA) runoff[top2[1]!] = (runoff[top2[1]!] ?? 0) + 1;
  }

  const winner =
    (runoff[top2[0]!] ?? 0) >= (runoff[top2[1]!] ?? 0) ? top2[0]! : top2[1]!;

  const sum = Object.values(totals).reduce((a, b) => a + b, 1);
  const candidateShares: Record<string, number> = {};
  for (const [id, total] of Object.entries(totals)) {
    candidateShares[id] = total / sum;
  }

  return { candidateShares, winner };
}
