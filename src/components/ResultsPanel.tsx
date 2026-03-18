import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SimulationResult } from '../types';
import { VOTING_METHOD_LABELS } from '../types';
import { SatisfactionMeter } from './SatisfactionMeter';
import styles from './ResultsPanel.module.css';

interface Props {
  result: SimulationResult;
  onVoteAgain: () => void;
}

// Slightly lighten/darken a hex color by amount (-1 to 1)
function shadeColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(amount * 255)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(amount * 255)));
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(amount * 255)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function ResultsPanel({ result, onVoteAgain }: Props) {
  const { config, parties, candidates, electionResult, trueFeelings } = result;

  const winnerCandidate = candidates.find(c => c.id === electionResult.winner);
  const winnerParty = parties.find(p => p.id === winnerCandidate?.partyId);

  // Election results pie data (by candidate)
  const electionData = candidates
    .map((c, idx) => {
      const party = parties.find(p => p.id === c.partyId);
      const partyIdx = parties.findIndex(p => p.id === c.partyId);
      const candidatesOfParty = candidates.filter(x => x.partyId === c.partyId);
      const subIdx = candidatesOfParty.indexOf(c);
      // Shade per candidate within same party
      const shadeAmt = candidatesOfParty.length > 1
        ? (subIdx / (candidatesOfParty.length - 1) - 0.5) * 0.25
        : 0;
      void partyIdx; void idx;
      return {
        name: c.name,
        value: Math.round((electionResult.candidateShares[c.id] ?? 0) * 100),
        color: shadeColor(party?.color ?? '#888', shadeAmt),
        isWinner: c.id === electionResult.winner,
      };
    })
    .filter(d => d.value > 0);

  // True feelings pie data (by party)
  const feelingsData = parties.map(p => ({
    name: p.name,
    value: Math.round((trueFeelings.partyShares[p.id] ?? 0) * 100),
    color: p.color,
  })).filter(d => d.value > 0);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Election Results</h2>
          <p className={styles.method}>{VOTING_METHOD_LABELS[config.method]}</p>
        </div>
        <button className={styles.againBtn} onClick={onVoteAgain}>
          ← Vote Again
        </button>
      </div>

      {winnerCandidate && (
        <div className={styles.winner} style={{ borderColor: winnerParty?.color }}>
          <span className={styles.winnerLabel}>Winner</span>
          <span className={styles.winnerName}>{winnerCandidate.name}</span>
          <span className={styles.winnerParty} style={{ color: winnerParty?.color }}>
            {winnerParty?.name}
          </span>
        </div>
      )}

      {electionResult.note && (
        <div className={styles.note}>{electionResult.note}</div>
      )}

      <div className={styles.chartsRow}>
        <div className={styles.chartContainer}>
          <p className={styles.chartLabel}>Election Results</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={electionData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {electionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
          <p className={styles.chartLabel}>True Voter Feelings</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={feelingsData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
              >
                {feelingsData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SatisfactionMeter
        score={result.satisfactionScore}
        label={result.satisfactionLabel}
        description={result.satisfactionDescription}
        choiceCoverage={result.choiceCoverage}
      />

      {electionResult.rounds && electionResult.rounds.length > 0 && (
        <details className={styles.rounds}>
          <summary className={styles.roundsSummary}>
            RCV Rounds ({electionResult.rounds.length} elimination{electionResult.rounds.length !== 1 ? 's' : ''})
          </summary>
          <div className={styles.roundsList}>
            {electionResult.rounds.map(r => {
              const elim = candidates.find(c => c.id === r.eliminated);
              return (
                <div key={r.roundNumber} className={styles.round}>
                  <span className={styles.roundNum}>Round {r.roundNumber}</span>
                  <span className={styles.roundElim}>
                    Eliminated: <span style={{ color: parties.find(p => p.id === elim?.partyId)?.color }}>
                      {elim?.name ?? r.eliminated}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
