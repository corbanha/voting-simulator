import type { Voter, Candidate, ElectionResult } from '../types';
import { buildScoreBallot } from './ballotBuilder';

export function runScore(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const totals: Record<string, number> = {};
  for (const c of candidates) totals[c.id] = 0;

  for (const voter of voters) {
    const ballot = buildScoreBallot(voter, candidates, candidatesPerParty);
    for (const [id, score] of Object.entries(ballot)) {
      totals[id] = (totals[id] ?? 0) + score;
    }
  }

  const sum = Object.values(totals).reduce((a, b) => a + b, 1);
  const candidateShares: Record<string, number> = {};
  for (const [id, total] of Object.entries(totals)) {
    candidateShares[id] = total / sum;
  }

  const winner = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]![0];
  return { candidateShares, winner };
}
