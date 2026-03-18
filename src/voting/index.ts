import type { Voter, Candidate, VotingMethod, ElectionResult } from '../types';
import { runFPTP } from './fptp';
import { runRCV } from './rcv';
import { runApproval } from './approval';
import { runScore } from './score';
import { runCondorcet } from './condorcet';
import { runBorda } from './borda';
import { runSTAR } from './star';

export function runElection(
  method: VotingMethod,
  voters: Voter[],
  candidates: Candidate[],
  candidatesPerParty: number,
): ElectionResult {
  switch (method) {
    case 'fptp':      return runFPTP(voters, candidates, candidatesPerParty);
    case 'rcv':       return runRCV(voters, candidates, candidatesPerParty);
    case 'approval':  return runApproval(voters, candidates, candidatesPerParty);
    case 'score':     return runScore(voters, candidates, candidatesPerParty);
    case 'condorcet': return runCondorcet(voters, candidates, candidatesPerParty);
    case 'borda':     return runBorda(voters, candidates, candidatesPerParty);
    case 'star':      return runSTAR(voters, candidates, candidatesPerParty);
  }
}
