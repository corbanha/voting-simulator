import type { Party, Voter } from '../types';

function generateVotersWithRand(parties: Party[], rand: () => number): Voter[] {
  const n = parties.length;
  if (n === 0) return [];

  const totalLean = parties.reduce((s, p) => s + p.leanWeight, 0);
  const leanProbs = parties.map(p => p.leanWeight / totalLean);

  // Sample a party index weighted by lean
  const sampleParty = () => {
    let r = rand();
    for (let i = 0; i < n; i++) {
      r -= leanProbs[i]!;
      if (r <= 0) return i;
    }
    return n - 1;
  };

  // Normalize an array to sum to 1
  const normalize = (arr: number[]) => {
    const total = arr.reduce((a, b) => a + b, 0);
    return arr.map(w => w / total);
  };

  // Generate a single voter's raw weights based on a randomly chosen "type"
  const makeVoter = (): number[] => {
    // Roll to decide what kind of voter this is
    const roll = rand();

    if (roll < 0.30) {
      // Strong partisan: 70–95% for one party
      const dom = sampleParty();
      const strength = 0.70 + rand() * 0.25;
      const base = parties.map((_, i) => i === dom ? strength : rand() * 0.15);
      return normalize(base);

    } else if (roll < 0.50) {
      // Moderate partisan: 50–70% for one party, the rest shared among others
      const dom = sampleParty();
      const strength = 0.50 + rand() * 0.20;
      const base = parties.map((_, i) => i === dom ? strength : rand() * 0.25);
      return normalize(base);

    } else if (roll < 0.68) {
      // Neck-and-neck between 2 parties (swing voter)
      const a = sampleParty();
      let b = sampleParty();
      // Pick a different second party if possible
      if (n > 1) {
        let attempts = 0;
        while (b === a && attempts < 10) { b = sampleParty(); attempts++; }
        if (b === a) b = (a + 1) % n;
      }
      const splitA = 0.35 + rand() * 0.30; // 35–65%
      const splitB = 1 - splitA;
      const base = parties.map((_, i) => {
        if (i === a) return splitA;
        if (i === b) return splitB;
        return rand() * 0.05; // tiny residual for others
      });
      return normalize(base);

    } else if (roll < 0.80) {
      // Three-way split: roughly equal among 3 parties
      if (n < 3) {
        // Fall back to 2-way split if fewer than 3 parties
        const a = sampleParty();
        const b = (a + 1) % n;
        const splitA = 0.35 + rand() * 0.30;
        const base = parties.map((_, i) => i === a ? splitA : i === b ? 1 - splitA : rand() * 0.05);
        return normalize(base);
      }
      // Pick 3 distinct parties (weighted by lean)
      const picks: number[] = [];
      let attempts = 0;
      while (picks.length < 3 && attempts < 20) {
        const p = sampleParty();
        if (!picks.includes(p)) picks.push(p);
        attempts++;
      }
      while (picks.length < 3) {
        for (let i = 0; i < n && picks.length < 3; i++) {
          if (!picks.includes(i)) picks.push(i);
        }
      }
      // Each of the 3 gets ~25–42%, must sum to ~100%
      const s1 = 0.25 + rand() * 0.17;
      const s2 = 0.25 + rand() * 0.17;
      const s3 = Math.max(0.05, 1 - s1 - s2);
      const shares = [s1, s2, s3];
      const base = parties.map((_, i) => {
        const idx = picks.indexOf(i);
        return idx >= 0 ? shares[idx]! : rand() * 0.03;
      });
      return normalize(base);

    } else if (roll < 0.88) {
      // Contrarian: strongly AGAINST one party (that party gets < 5%), rest divided
      const avoid = sampleParty();
      const base = parties.map((_, i) => i === avoid ? rand() * 0.05 : 0.2 + rand() * 0.6);
      return normalize(base);

    } else {
      // Genuinely undecided: nearly uniform across all parties with light noise
      const base = parties.map(() => 0.5 + rand() * 0.5);
      return normalize(base);
    }
  };

  const voters: Voter[] = [];
  for (let i = 0; i < 1000; i++) {
    const weights = makeVoter();

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

export function generateVoters(parties: Party[]): Voter[] {
  return generateVotersWithRand(parties, Math.random);
}
