import type { Party } from '../types';
import { PARTY_COLORS } from '../data/parties';
import styles from './PartyManager.module.css';

interface Props {
  parties: Party[];
  onUpdateLean: (id: string, weight: number) => void;
  onAddParty: () => void;
  onRemoveParty: (id: string) => void;
}

export function PartyManager({ parties, onUpdateLean, onAddParty, onRemoveParty }: Props) {
  const canAdd = parties.length < 8;
  const canRemove = parties.length > 2;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <span className={styles.sectionTitle}>Parties & Population Lean</span>
        <button
          className={styles.addBtn}
          onClick={onAddParty}
          disabled={!canAdd}
          title={canAdd ? 'Add a party' : 'Maximum 8 parties'}
        >
          + Add Party
        </button>
      </div>
      <div className={styles.partyList}>
        {parties.map((party, idx) => (
          <div key={party.id} className={styles.partyRow}>
            <div
              className={styles.colorSwatch}
              style={{ backgroundColor: PARTY_COLORS[idx % PARTY_COLORS.length] ?? party.color }}
            />
            <span className={styles.partyName}>{party.name}</span>
            <div className={styles.sliderWrapper}>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={party.leanWeight}
                onChange={e => onUpdateLean(party.id, parseFloat(e.target.value))}
                className={styles.slider}
                style={{ '--thumb-color': party.color } as React.CSSProperties}
              />
              <span className={styles.sliderVal}>{Math.round((party.leanWeight / parties.reduce((s, p) => s + p.leanWeight, 0)) * 100)}%</span>
            </div>
            <button
              className={styles.removeBtn}
              onClick={() => onRemoveParty(party.id)}
              disabled={!canRemove}
              title={canRemove ? 'Remove party' : 'Need at least 2 parties'}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
