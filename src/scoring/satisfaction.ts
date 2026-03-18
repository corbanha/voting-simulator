import type { Voter, Candidate, ElectionResult, TrueFeelings, Party } from '../types';

export function computeTrueFeelings(voters: Voter[], parties: Party[]): TrueFeelings {
  const partyShares: Record<string, number> = {};
  for (const p of parties) partyShares[p.id] = 0;

  for (const voter of voters) {
    for (const [partyId, weight] of Object.entries(voter.partyWeights)) {
      partyShares[partyId] = (partyShares[partyId] ?? 0) + weight;
    }
  }

  const total = Object.values(partyShares).reduce((a, b) => a + b, 1);
  for (const id in partyShares) {
    partyShares[id] = (partyShares[id] ?? 0) / total;
  }

  return { partyShares };
}

/**
 * For each voter, rank parties by their weight.
 * Returns the % of voters for whom the winning party is their 1st, 2nd, or 3rd choice.
 */
function computeChoiceCoverage(
  voters: Voter[],
  winnerPartyId: string,
): { first: number; firstOrSecond: number; firstSecondOrThird: number } {
  let first = 0;
  let firstOrSecond = 0;
  let firstSecondOrThird = 0;

  for (const voter of voters) {
    const ranked = Object.entries(voter.partyWeights)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const rank = ranked.indexOf(winnerPartyId);
    if (rank === 0) { first++; firstOrSecond++; firstSecondOrThird++; }
    else if (rank === 1) { firstOrSecond++; firstSecondOrThird++; }
    else if (rank === 2) { firstSecondOrThird++; }
  }

  const n = voters.length;
  return {
    first: first / n,
    firstOrSecond: firstOrSecond / n,
    firstSecondOrThird: firstSecondOrThird / n,
  };
}

export function computeSatisfaction(
  electionResult: ElectionResult,
  trueFeelings: TrueFeelings,
  candidates: Candidate[],
  voters: Voter[],
): { score: number; label: string; description: string; choiceCoverage: { first: number; firstOrSecond: number; firstSecondOrThird: number } } {
  const winner = candidates.find(c => c.id === electionResult.winner);
  const winnerPartyId = winner?.partyId ?? '';
  const winnerTrueSupport = trueFeelings.partyShares[winnerPartyId] ?? 0;

  const choiceCoverage = computeChoiceCoverage(voters, winnerPartyId);

  // What share of voter weight is represented by parties that got > 5% of vote
  const representedParties = new Set<string>();
  for (const [candId, share] of Object.entries(electionResult.candidateShares)) {
    if (share > 0.05) {
      const cand = candidates.find(c => c.id === candId);
      if (cand) representedParties.add(cand.partyId);
    }
  }
  const representedWeight = Object.entries(trueFeelings.partyShares)
    .filter(([id]) => representedParties.has(id))
    .reduce((sum, [, share]) => sum + share, 0);

  // Score: weight 1st choice support + partial credit for 2nd choice coverage + representation
  const score = 0.5 * winnerTrueSupport + 0.3 * choiceCoverage.firstOrSecond + 0.2 * representedWeight;

  let label: string;
  let description: string;
  const firstPct = Math.round(choiceCoverage.first * 100);
  const firstOrSecondPct = Math.round(choiceCoverage.firstOrSecond * 100);

  if (score >= 0.75) {
    label = 'Strong Alignment';
    description = `${firstPct}% of voters got their 1st choice party. ${firstOrSecondPct}% got their 1st or 2nd choice.`;
  } else if (score >= 0.55) {
    label = 'Moderate Alignment';
    description = `${firstPct}% got their 1st choice, but ${firstOrSecondPct}% are satisfied with their 1st or 2nd pick.`;
  } else if (score >= 0.35) {
    label = 'Weak Alignment';
    description = `Only ${firstPct}% of voters preferred the winning party. ${firstOrSecondPct}% had it as 1st or 2nd choice.`;
  } else {
    label = 'Poor Alignment';
    description = `Only ${firstPct}% wanted the winning party as their 1st choice, and just ${firstOrSecondPct}% as 1st or 2nd.`;
  }

  return { score, label, description, choiceCoverage };
}
