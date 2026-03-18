export interface Party {
  id: string;
  name: string;
  color: string;
  leanWeight: number; // 0–1, user-adjustable
}

export interface Voter {
  id: number;
  partyWeights: Record<string, number>; // sums to 1.0
  dominantParty: string;
  dominantWeight: number;
}

export interface Candidate {
  id: string; // e.g. "blue_0"
  partyId: string;
  name: string;
}

export type VotingMethod =
  | 'fptp'
  | 'rcv'
  | 'approval'
  | 'score'
  | 'condorcet'
  | 'borda'
  | 'star';

export interface SimConfig {
  method: VotingMethod;
  numPartiesOnBallot: number;
  candidatesPerParty: number;
}

export interface RCVRound {
  roundNumber: number;
  counts: Record<string, number>;
  eliminated: string;
}

export interface ElectionResult {
  candidateShares: Record<string, number>; // normalized 0–1
  winner: string;
  rounds?: RCVRound[];
  note?: string;
}

export interface TrueFeelings {
  partyShares: Record<string, number>; // weighted avg across all voters
}

export interface ChoiceCoverage {
  first: number;
  firstOrSecond: number;
  firstSecondOrThird: number;
}

export interface SimulationResult {
  config: SimConfig;
  parties: Party[];
  candidates: Candidate[];
  electionResult: ElectionResult;
  trueFeelings: TrueFeelings;
  satisfactionScore: number;
  satisfactionLabel: string;
  satisfactionDescription: string;
  choiceCoverage: ChoiceCoverage;
}

export const VOTING_METHOD_LABELS: Record<VotingMethod, string> = {
  fptp: 'First Past the Post',
  rcv: 'Ranked Choice (IRV)',
  approval: 'Approval Voting',
  score: 'Score / Range Voting',
  condorcet: 'Condorcet Method',
  borda: 'Borda Count',
  star: 'STAR Voting',
};
