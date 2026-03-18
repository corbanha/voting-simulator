import type { Voter, Candidate, ElectionResult } from '../types';
import { buildRanking } from './ballotBuilder';

export function runCondorcet(
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  const ids = candidates.map(c => c.id);

  // Build rankings once
  const rankings = voters.map(v =>
    buildRanking(v, candidates, candidatesPerParty),
  );

  // Pairwise preference matrix: pairwise[A][B] = # voters who prefer A over B
  const pairwise: Record<string, Record<string, number>> = {};
  for (const a of ids) {
    pairwise[a] = {};
    for (const b of ids) pairwise[a]![b] = 0;
  }

  for (const ranking of rankings) {
    for (let i = 0; i < ranking.length; i++) {
      for (let j = i + 1; j < ranking.length; j++) {
        const a = ranking[i]!;
        const b = ranking[j]!;
        pairwise[a]![b] = (pairwise[a]![b] ?? 0) + 1;
      }
    }
  }

  // Find Condorcet winner
  let condorcetWinner: string | null = null;
  for (const a of ids) {
    const beatsAll = ids.every(
      b => b === a || (pairwise[a]![b] ?? 0) > (pairwise[b]![a] ?? 0),
    );
    if (beatsAll) {
      condorcetWinner = a;
      break;
    }
  }

  let winner: string;
  let note: string | undefined;

  if (condorcetWinner) {
    winner = condorcetWinner;
  } else {
    // Minimax: minimize worst pairwise loss
    note = 'No Condorcet winner found — minimax tiebreaker used';
    let bestWorstLoss = Infinity;
    winner = ids[0]!;
    for (const a of ids) {
      const worstLoss = Math.max(
        ...ids
          .filter(b => b !== a)
          .map(b => (pairwise[b]![a] ?? 0) - (pairwise[a]![b] ?? 0)),
      );
      if (worstLoss < bestWorstLoss) {
        bestWorstLoss = worstLoss;
        winner = a;
      }
    }
  }

  // Shares: average pairwise win margin (normalized)
  const winScores: Record<string, number> = {};
  for (const a of ids) {
    const totalWins = ids
      .filter(b => b !== a)
      .reduce(
        (sum, b) =>
          sum + Math.max(0, (pairwise[a]![b] ?? 0) - (pairwise[b]![a] ?? 0)),
        0,
      );
    winScores[a] = totalWins;
  }
  const totalScore = Object.values(winScores).reduce((a, b) => a + b, 1);
  const candidateShares: Record<string, number> = {};
  for (const [id, score] of Object.entries(winScores)) {
    candidateShares[id] = score / totalScore;
  }

  return { candidateShares, winner, note };
}
