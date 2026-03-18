import type { Party, Voter } from '../types';


export function generateVoters(parties: Party[], seed?: number): Voter[] {
  // Use seed for reproducibility if provided
  if (seed !== undefined) {
    // Simple seeded random using closure — replace Math.random locally
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
    return generateVotersWithRand(parties, rand);
  }
  return generateVotersWithRand(parties, Math.random);
}

function generateVotersWithRand(
  parties: Party[],
  rand: () => number,
): Voter[] {
  const n = parties.length;
  if (n === 0) return [];

  // Normalize lean weights
  const totalLean = parties.reduce((s, p) => s + p.leanWeight, 0);
  const leanProbs = parties.map(p => p.leanWeight / totalLean);

  // Create 6 voter blocs, each dominated by one party (sampled by lean)
  const NUM_BLOCS = 6;
  const blocs: number[][] = [];
  for (let b = 0; b < NUM_BLOCS; b++) {
    // Sample dominant party for this bloc, weighted by lean
    let r = rand();
    let dominant = n - 1;
    for (let i = 0; i < n; i++) {
      r -= leanProbs[i]!;
      if (r <= 0) { dominant = i; break; }
    }
    const base = parties.map((_, i) => {
      if (i === dominant) return 0.65 + rand() * 0.2; // 65–85%
      return rand() * 0.1;
    });
    const total = base.reduce((a, b) => a + b, 0);
    blocs.push(base.map(w => w / total));
  }

  const voters: Voter[] = [];
  for (let i = 0; i < 1000; i++) {
    // Pick a bloc
    const blocIdx = Math.floor(rand() * NUM_BLOCS);
    const base = blocs[blocIdx]!;
    // Add per-voter noise
    const rawWeights = base.map(w => Math.max(0, w + (rand() - 0.5) * 0.15));
    const total = rawWeights.reduce((a, b) => a + b, 0);
    const weights = rawWeights.map(w => w / total);

    const partyWeights: Record<string, number> = {};
    let dominantParty = parties[0]!.id;
    let dominantWeight = 0;
    parties.forEach((p, idx) => {
      partyWeights[p.id] = weights[idx]!;
      if (weights[idx]! > dominantWeight) {
        dominantWeight = weights[idx]!;
        dominantParty = p.id;
      }
    });

    voters.push({ id: i, partyWeights, dominantParty, dominantWeight });
  }

  return voters;
}
