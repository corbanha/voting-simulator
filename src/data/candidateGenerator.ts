import type { Candidate, Party } from '../types';

const FIRST_NAMES = [
  'Alex', 'Blake', 'Casey', 'Dana', 'Ellis',
  'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan',
  'Kelly', 'Lane', 'Morgan', 'Noel', 'Oakley',
  'Parker', 'Quinn', 'Riley', 'Sage', 'Taylor',
];

export function generateCandidates(
  parties: Party[],
  candidatesPerParty: number,
  numPartiesOnBallot: number,
): Candidate[] {
  const ballotParties = parties.slice(0, numPartiesOnBallot);
  const names = [...FIRST_NAMES];
  const candidates: Candidate[] = [];

  for (const party of ballotParties) {
    for (let j = 0; j < candidatesPerParty; j++) {
      const name = names.shift() ?? `Candidate ${candidates.length + 1}`;
      candidates.push({
        id: `${party.id}_${j}`,
        partyId: party.id,
        name: `${name} ${party.name[0]}.`,
      });
    }
  }

  return candidates;
}
