import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Voter, Party } from '../types';
import styles from './VoterDot.module.css';

interface TooltipPos {
  x: number;
  y: number;
}

interface Props {
  voter: Voter;
  parties: Party[];
  onSelect?: (voter: Voter | null) => void;
  isSelected?: boolean;
}

export function VoterDot({ voter, parties, onSelect, isSelected }: Props) {
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const dominantParty = parties.find(p => p.id === voter.dominantParty);
  const color = dominantParty?.color ?? '#888';
  const opacity = 0.4 + 0.6 * voter.dominantWeight;

  const handleMouseEnter = () => {
    if (onSelect) return;
    if (!dotRef.current) return;
    const rect = dotRef.current.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const handleMouseLeave = () => {
    if (onSelect) return;
    setTooltipPos(null);
  };

  const handleClick = () => {
    if (!onSelect) return;
    onSelect(isSelected ? null : voter);
  };

  const tooltipContent = (
    <div
      className={styles.tooltip}
      style={{
        position: 'fixed',
        left: tooltipPos?.x ?? 0,
        top: (tooltipPos?.y ?? 0) - 8,
        transform: 'translateX(-50%) translateY(-100%)',
        zIndex: 9999,
      }}
    >
      <div className={styles.tooltipTitle}>Voter #{voter.id + 1}</div>
      {parties.map(party => {
        const pct = Math.round((voter.partyWeights[party.id] ?? 0) * 100);
        return (
          <div key={party.id} className={styles.tooltipRow}>
            <span className={styles.partyLabel}>{party.name}</span>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: `${pct}%`, backgroundColor: party.color }}
              />
            </div>
            <span className={styles.pct}>{pct}%</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      ref={dotRef}
      className={`${styles.dot} ${isSelected ? styles.selected : ''}`}
      style={{ backgroundColor: color, opacity }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Portal renders tooltip into document.body, escaping all transform/overflow stacking contexts */}
      {tooltipPos && !onSelect && createPortal(tooltipContent, document.body)}
    </div>
  );
}
