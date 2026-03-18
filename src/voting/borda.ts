import type { Voter, Candidate, ElectionResult } from '../types';
import { buildRanking } from './ballotBuilder';

export function runBorda(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const n = candidates.length;
  const points: Record<string, number> = {};
  for (const c of candidates) points[c.id] = 0;

  for (const voter of voters) {
    const ranking = buildRanking(voter, candidates, candidatesPerParty);
    ranking.forEach((id, idx) => {
      points[id] = (points[id] ?? 0) + (n - 1 - idx);
    });
  }

  const sum = Object.values(points).reduce((a, b) => a + b, 1);
  const candidateShares: Record<string, number> = {};
  for (const [id, pts] of Object.entries(points)) {
    candidateShares[id] = pts / sum;
  }

  const winner = Object.entries(points).sort((a, b) => b[1] - a[1])[0]![0];
  return { candidateShares, winner };
}
