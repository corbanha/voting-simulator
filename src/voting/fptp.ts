import type { Voter, Candidate, ElectionResult } from '../types';
import { buildFPTPBallot } from './ballotBuilder';

export function runFPTP(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const counts: Record<string, number> = {};
  for (const c of candidates) counts[c.id] = 0;

  for (const voter of voters) {
    const vote = buildFPTPBallot(voter, candidates, candidatesPerParty);
    counts[vote] = (counts[vote] ?? 0) + 1;
  }

  const total = voters.length;
  const candidateShares: Record<string, number> = {};
  for (const [id, count] of Object.entries(counts)) {
    candidateShares[id] = count / total;
  }

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]![0];
  return { candidateShares, winner };
}
