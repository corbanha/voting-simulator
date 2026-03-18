import type { Voter, Candidate, ElectionResult, RCVRound } from '../types';
import { buildRanking } from './ballotBuilder';

export function runRCV(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  // Build all rankings upfront
  const rankings = voters.map(v =>
    buildRanking(v, candidates, candidatesPerParty),
  );

  const active = new Set(candidates.map(c => c.id));
  const rounds: RCVRound[] = [];
  let roundNumber = 1;
  let winner: string | null = null;

  while (active.size > 1) {
    const counts: Record<string, number> = {};
    for (const id of active) counts[id] = 0;

    for (const ranking of rankings) {
      const topChoice = ranking.find(id => active.has(id));
      if (topChoice) counts[topChoice] = (counts[topChoice] ?? 0) + 1;
    }

    const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
    const majority = totalVotes / 2;

    // Check for winner
    for (const [id, count] of Object.entries(counts)) {
      if (count > majority) {
        winner = id;
        break;
      }
    }

    if (winner) break;

    // Eliminate lowest
    const sorted = Object.entries(counts).sort((a, b) => a[1] - b[1]);
    const eliminated = sorted[0]![0];

    rounds.push({ roundNumber, counts: { ...counts }, eliminated });
    active.delete(eliminated);
    roundNumber++;
  }

  if (!winner) {
    winner = [...active][0]!;
  }

  // Final candidateShares: last round proportions
  const finalCounts: Record<string, number> = {};
  for (const id of candidates.map(c => c.id)) finalCounts[id] = 0;
  for (const ranking of rankings) {
    const topChoice = ranking.find(id => active.has(id));
    if (topChoice) finalCounts[topChoice] = (finalCounts[topChoice] ?? 0) + 1;
  }

  const total = voters.length;
  const candidateShares: Record<string, number> = {};
  for (const [id, count] of Object.entries(finalCounts)) {
    candidateShares[id] = count / total;
  }

  return { candidateShares, winner, rounds };
}
