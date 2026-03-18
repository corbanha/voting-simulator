import { useState, useCallback, useEffect } from 'react';
import type { Party, SimConfig, SimulationResult, VotingMethod } from './types';
import { DEFAULT_PARTIES, PARTY_COLORS } from './data/parties';
import { generateVoters } from './data/voterGenerator';
import { generateCandidates } from './data/candidateGenerator';
import { runElection } from './voting/index';
import { computeTrueFeelings, computeSatisfaction } from './scoring/satisfaction';
import { loadUrlState, useUrlSync } from './hooks/useUrlParams';
import { ControlPanel } from './components/ControlPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { VoterField } from './components/VoterField';
import styles from './App.module.css';

const DEFAULT_CONFIG: SimConfig = {
  method: 'fptp' as VotingMethod,
  numPartiesOnBallot: 3,
  candidatesPerParty: 1,
};

function initState() {
  const { config, parties } = loadUrlState(DEFAULT_CONFIG, DEFAULT_PARTIES.slice(0, 3));
  const voters = generateVoters(parties);
  return { config, parties, voters };
}

let partyCounter = DEFAULT_PARTIES.length;

export default function App() {
  const [{ config, parties, voters }, setState] = useState(initState);
  const [phase, setPhase] = useState<'setup' | 'results'>('setup');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useUrlSync(config, parties);

  const setConfig = useCallback((newConfig: SimConfig) => {
    setState(s => ({ ...s, config: newConfig }));
  }, []);

  const handleRandomize = useCallback(() => {
    setState(s => ({ ...s, voters: generateVoters(s.parties) }));
  }, []);

  const handleUpdateLean = useCallback((id: string, weight: number) => {
    setState(s => {
      const newParties = s.parties.map(p => p.id === id ? { ...p, leanWeight: weight } : p);
      return { ...s, parties: newParties, voters: generateVoters(newParties) };
    });
  }, []);

  const handleAddParty = useCallback(() => {
    setState(s => {
      const idx = partyCounter % PARTY_COLORS.length;
      partyCounter++;
      const id = `party_${partyCounter}`;
      const newParty: Party = {
        id,
        name: `Party ${partyCounter}`,
        color: PARTY_COLORS[idx] ?? '#888',
        leanWeight: 1,
      };
      const newParties = [...s.parties, newParty];
      const newConfig = {
        ...s.config,
        numPartiesOnBallot: Math.min(s.config.numPartiesOnBallot + 1, newParties.length),
      };
      return {
        parties: newParties,
        voters: generateVoters(newParties),
        config: newConfig,
      };
    });
  }, []);

  const handleRemoveParty = useCallback((id: string) => {
    setState(s => {
      if (s.parties.length <= 2) return s;
      const newParties = s.parties.filter(p => p.id !== id);
      const newConfig = {
        ...s.config,
        numPartiesOnBallot: Math.min(s.config.numPartiesOnBallot, newParties.length),
      };
      return {
        parties: newParties,
        voters: generateVoters(newParties),
        config: newConfig,
      };
    });
  }, []);

  const handleVote = useCallback(() => {
    const candidates = generateCandidates(parties, config.candidatesPerParty, config.numPartiesOnBallot);
    const electionResult = runElection(config.method, voters, candidates, config.candidatesPerParty);
    const trueFeelings = computeTrueFeelings(voters, parties);
    const { score, label, description, choiceCoverage } = computeSatisfaction(
      electionResult, trueFeelings, candidates, voters,
    );

    setResult({
      config,
      parties,
      candidates,
      electionResult,
      trueFeelings,
      satisfactionScore: score,
      satisfactionLabel: label,
      satisfactionDescription: description,
      choiceCoverage,
    });
    setPhase('results');
  }, [config, parties, voters]);

  const handleVoteAgain = useCallback(() => {
    setPhase('setup');
    setResult(null);
  }, []);

  return (
    <div className={styles.app}>
      <button
        className={styles.themeToggle}
        onClick={() => setDark(d => !d)}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? '☀️' : '🌙'}
      </button>

      <main className={styles.main}>
        {phase === 'setup' && (
          <ControlPanel
            config={config}
            parties={parties}
            onConfigChange={setConfig}
            onVote={handleVote}
          />
        )}
        {phase === 'results' && result && (
          <ResultsPanel result={result} onVoteAgain={handleVoteAgain} />
        )}
      </main>
      <footer className={styles.footer}>
        <VoterField
          voters={voters}
          parties={parties}
          onRandomize={handleRandomize}
          onUpdateLean={handleUpdateLean}
          onAddParty={handleAddParty}
          onRemoveParty={handleRemoveParty}
        />
      </footer>
    </div>
  );
}
