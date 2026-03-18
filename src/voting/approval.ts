import type { Voter, Candidate, ElectionResult } from '../types';
import { buildApprovalBallot } from './ballotBuilder';

export function runApproval(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const scores: Record<string, number> = {};
  for (const c of candidates) scores[c.id] = 0;

  for (const voter of voters) {
    const approved = buildApprovalBallot(voter, candidates, candidatesPerParty);
    for (const id of approved) {
      scores[id] = (scores[id] ?? 0) + 1;
    }
  }

  const maxScore = Math.max(...Object.values(scores), 1);
  const candidateShares: Record<string, number> = {};
  for (const [id, score] of Object.entries(scores)) {
    candidateShares[id] = score / maxScore;
  }

  // Normalize to sum to 1
  const total = Object.values(candidateShares).reduce((a, b) => a + b, 0);
  for (const id in candidateShares) {
    candidateShares[id] = (candidateShares[id] ?? 0) / total;
  }

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]![0];
  return { candidateShares, winner };
}
