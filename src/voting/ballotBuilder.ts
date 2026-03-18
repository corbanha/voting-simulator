import type { Voter, Candidate } from '../types';

/** Compute utility of a candidate for a voter. */
export function candidateUtility(
  voter: Voter,
  candidate: Candidate,
  candidatesPerParty: number,
): number {
  const partyWeight = voter.partyWeights[candidate.partyId] ?? 0;
  // Divide by candidatesPerParty to model vote-splitting
  return partyWeight / candidatesPerParty + (Math.random() - 0.5) * 0.02;
}

/** Build ranked ballot: candidates sorted by utility descending. */
export function buildRanking(
  voter: Voter,
  candidates: Candidate[],
  candidatesPerParty: number,
): string[] {
  return [...candidates]
    .map(c => ({ id: c.id, u: candidateUtility(voter, c, candidatesPerParty) }))
    .sort((a, b) => b.u - a.u)
    .map(x => x.id);
}

/** FPTP ballot: single best candidate. */
export function buildFPTPBallot(
  voter: Voter,
  candidates: Candidate[],
  candidatesPerParty: number,
): string {
  const ranking = buildRanking(voter, candidates, candidatesPerParty);
  return ranking[0]!;
}

/** Approval ballot: approve candidates above threshold. */
export function buildApprovalBallot(
  voter: Voter,
  candidates: Candidate[],
  candidatesPerParty: number,
): Set<string> {
  const utils = candidates.map(c => ({
    id: c.id,
    u: candidateUtility(voter, c, candidatesPerParty),
  }));
  const maxU = Math.max(...utils.map(x => x.u));
  const threshold = maxU * 0.4;
  return new Set(utils.filter(x => x.u >= threshold).map(x => x.id));
}

/** Score ballot: 0–5 integer scores. */
export function buildScoreBallot(
  voter: Voter,
  candidates: Candidate[],
  candidatesPerParty: number,
): Record<string, number> {
  const utils = candidates.map(c => ({
    id: c.id,
    u: Math.max(0, candidateUtility(voter, c, candidatesPerParty)),
  }));
  const maxU = Math.max(...utils.map(x => x.u), 0.001);
  const scores: Record<string, number> = {};
  for (const { id, u } of utils) {
    scores[id] = Math.round((u / maxU) * 5);
  }
  return scores;
}
