import type { ChoiceCoverage } from '../types';
import styles from './SatisfactionMeter.module.css';

interface Props {
  score: number;
  label: string;
  description: string;
  choiceCoverage: ChoiceCoverage;
}

function scoreColor(score: number): string {
  if (score >= 0.75) return '#16a34a';
  if (score >= 0.55) return '#65a30d';
  if (score >= 0.35) return '#ea580c';
  return '#dc2626';
}

export function SatisfactionMeter({ score, label, description, choiceCoverage }: Props) {
  const color = scoreColor(score);
  const pct = Math.round(score * 100);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.sectionLabel}>Satisfaction Score</span>
        <span className={styles.label} style={{ color }}>{label}</span>
      </div>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className={styles.footer}>
        <span className={styles.description}>{description}</span>
        <span className={styles.score} style={{ color }}>{pct}%</span>
      </div>

      <div className={styles.coverage}>
        <div className={styles.coverageRow}>
          <span className={styles.coverageLabel}>1st choice</span>
          <div className={styles.coverageBar}>
            <div
              className={styles.coverageFill}
              style={{ width: `${Math.round(choiceCoverage.first * 100)}%`, backgroundColor: '#3b82f6' }}
            />
          </div>
          <span className={styles.coveragePct}>{Math.round(choiceCoverage.first * 100)}%</span>
        </div>
        <div className={styles.coverageRow}>
          <span className={styles.coverageLabel}>1st or 2nd</span>
          <div className={styles.coverageBar}>
            <div
              className={styles.coverageFill}
              style={{ width: `${Math.round(choiceCoverage.firstOrSecond * 100)}%`, backgroundColor: '#8b5cf6' }}
            />
          </div>
          <span className={styles.coveragePct}>{Math.round(choiceCoverage.firstOrSecond * 100)}%</span>
        </div>
        <div className={styles.coverageRow}>
          <span className={styles.coverageLabel}>Top 3</span>
          <div className={styles.coverageBar}>
            <div
              className={styles.coverageFill}
              style={{ width: `${Math.round(choiceCoverage.firstSecondOrThird * 100)}%`, backgroundColor: '#a78bfa' }}
            />
          </div>
          <span className={styles.coveragePct}>{Math.round(choiceCoverage.firstSecondOrThird * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
