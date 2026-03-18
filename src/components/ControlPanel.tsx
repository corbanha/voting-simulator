import type { SimConfig, VotingMethod, Party } from '../types';
import { VOTING_METHOD_LABELS } from '../types';
import styles from './ControlPanel.module.css';

const VOTING_METHODS: VotingMethod[] = [
  'fptp', 'rcv', 'approval', 'score', 'condorcet', 'borda', 'star',
];

const METHOD_DESCRIPTIONS: Record<VotingMethod, string> = {
  fptp:      'Each voter picks one candidate. Most votes wins.',
  rcv:       'Voters rank candidates. Lowest eliminated in rounds until majority.',
  approval:  'Voters approve any number of candidates. Most approvals wins.',
  score:     'Voters score each candidate 0–5. Highest total wins.',
  condorcet: 'Candidate that beats all others head-to-head wins.',
  borda:     'Points awarded by rank position. Most points wins.',
  star:      'Score voting + automatic runoff between top 2.',
};

interface Props {
  config: SimConfig;
  parties: Party[];
  onConfigChange: (config: SimConfig) => void;
  onVote: () => void;
}

export function ControlPanel({ config, parties, onConfigChange, onVote }: Props) {
  const maxPartiesOnBallot = parties.length;

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Voting Method Simulator</h1>
      <p className={styles.subtitle}>
        Configure a voting method below, then cast votes to see how well the result
        reflects what the electorate actually wants.
      </p>

      <div className={styles.section}>
        <label className={styles.label}>Voting Method</label>
        <select
          className={styles.select}
          value={config.method}
          onChange={e =>
            onConfigChange({ ...config, method: e.target.value as VotingMethod })
          }
        >
          {VOTING_METHODS.map(m => (
            <option key={m} value={m}>{VOTING_METHOD_LABELS[m]}</option>
          ))}
        </select>
        <p className={styles.methodDesc}>{METHOD_DESCRIPTIONS[config.method]}</p>
      </div>

      <div className={styles.row}>
        <div className={styles.section}>
          <label className={styles.label}>Parties on Ballot</label>
          <select
            className={styles.select}
            value={config.numPartiesOnBallot}
            onChange={e =>
              onConfigChange({ ...config, numPartiesOnBallot: parseInt(e.target.value, 10) })
            }
          >
            {Array.from({ length: maxPartiesOnBallot }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          {config.numPartiesOnBallot < parties.length && (
            <p className={styles.hint}>
              {parties.length - config.numPartiesOnBallot} party(s) excluded from ballot
            </p>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Candidates / Party</label>
          <select
            className={styles.select}
            value={config.candidatesPerParty}
            onChange={e =>
              onConfigChange({ ...config, candidatesPerParty: parseInt(e.target.value, 10) })
            }
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.ballotSummary}>
        {config.numPartiesOnBallot * config.candidatesPerParty} candidates on ballot
        &nbsp;·&nbsp;
        {config.numPartiesOnBallot} {config.numPartiesOnBallot === 1 ? 'party' : 'parties'}
      </div>

      <button className={styles.voteBtn} onClick={onVote}>
        Cast Votes
      </button>
    </div>
  );
}
