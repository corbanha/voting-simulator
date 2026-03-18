import { useState, useRef, useEffect } from 'react';
import type { Voter, Party } from '../types';
import { VoterDot } from './VoterDot';
import { PartyManager } from './PartyManager';
import styles from './VoterField.module.css';

const DOT_SIZE = 12;
const GAP = 3;
const CELL = DOT_SIZE + GAP;

const MOBILE_DOT_SIZE = 10;
const MOBILE_CELL = MOBILE_DOT_SIZE + GAP;

interface Props {
  voters: Voter[];
  parties: Party[];
  onRandomize: () => void;
  onUpdateLean: (id: string, weight: number) => void;
  onAddParty: () => void;
  onRemoveParty: (id: string) => void;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export function VoterField({ voters, parties, onRandomize, onUpdateLean, onAddParty, onRemoveParty }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [numRows, setNumRows] = useState(8);
  const [mobileDotsPerRow, setMobileDotsPerRow] = useState(0);
  const isMobile = useIsMobile();

  // Desktop: measure available width to compute how many rows for column-flow grid
  useEffect(() => {
    if (isMobile) return;
    const measure = () => {
      if (!gridRef.current) return;
      const w = gridRef.current.offsetWidth;
      const totalCells = voters.length;
      const minRows = Math.ceil((totalCells * CELL) / w);
      setNumRows(Math.max(minRows, 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [voters.length, isMobile]);

  // Mobile: measure available width to compute dots per row
  useEffect(() => {
    if (!isMobile) return;
    const measure = () => {
      if (!gridRef.current) return;
      const w = gridRef.current.offsetWidth;
      setMobileDotsPerRow(Math.max(Math.floor((w + GAP) / MOBILE_CELL), 1));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (gridRef.current) ro.observe(gridRef.current);
    return () => ro.disconnect();
  }, [isMobile]);

  // Close popover when clicking outside (desktop)
  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  // Dismiss selected voter when tapping outside the grid on mobile
  useEffect(() => {
    if (!isMobile || !selectedVoter) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setSelectedVoter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isMobile, selectedVoter]);

  // Sort voters by dominant party, then by weight
  // Desktop: column-flow creates vertical bands
  // Mobile: row-flow (flex-wrap) creates horizontal bands with same sort order
  const partyOrder = parties.map(p => p.id);
  const sorted = [...voters].sort((a, b) => {
    const ai = partyOrder.indexOf(a.dominantParty);
    const bi = partyOrder.indexOf(b.dominantParty);
    if (ai !== bi) return ai - bi;
    return b.dominantWeight - a.dominantWeight;
  });

  const gridHeight = numRows * CELL - GAP;

  // Mobile grid width snapped to exact dot grid so flex-wrap rows align cleanly
  const mobileGridWidth = mobileDotsPerRow > 0
    ? mobileDotsPerRow * MOBILE_CELL - GAP
    : undefined;

  const handleDotSelect = isMobile
    ? (voter: Voter | null) => setSelectedVoter(voter)
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>The Electorate ({voters.length.toLocaleString()} voters)</span>
        <div className={styles.controls}>
          {isMobile ? (
            <>
              <button
                ref={btnRef}
                className={`${styles.controlBtn} ${styles.controlBtnHalf} ${popoverOpen ? styles.active : ''}`}
                onClick={() => setPopoverOpen(o => !o)}
                title="Edit parties & population lean"
              >
                ⚙ Parties &amp; Lean
              </button>
              <button
                className={`${styles.controlBtn} ${styles.controlBtnHalf}`}
                onClick={onRandomize}
              >
                ⟳ Randomize
              </button>
            </>
          ) : (
            <>
              <div className={styles.popoverAnchor}>
                <button
                  ref={btnRef}
                  className={`${styles.controlBtn} ${popoverOpen ? styles.active : ''}`}
                  onClick={() => setPopoverOpen(o => !o)}
                  title="Edit parties & population lean"
                >
                  ⚙ Parties &amp; Lean
                </button>
                {popoverOpen && (
                  <div ref={popoverRef} className={styles.popover}>
                    <PartyManager
                      parties={parties}
                      onUpdateLean={onUpdateLean}
                      onAddParty={onAddParty}
                      onRemoveParty={onRemoveParty}
                    />
                  </div>
                )}
              </div>
              <button className={styles.controlBtn} onClick={onRandomize}>
                ⟳ Randomize
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile: inline Parties & Lean panel (below controls, above dot grid) */}
      {isMobile && popoverOpen && (
        <div ref={popoverRef} className={styles.mobileInlinePanel}>
          <PartyManager
            parties={parties}
            onUpdateLean={onUpdateLean}
            onAddParty={onAddParty}
            onRemoveParty={onRemoveParty}
          />
        </div>
      )}

      {/* Mobile: selected voter info panel */}
      {isMobile && selectedVoter && (
        <div className={styles.mobileVoterPanel}>
          <div className={styles.mobileVoterPanelHeader}>
            <span className={styles.mobileVoterPanelTitle}>Voter #{selectedVoter.id + 1}</span>
            <button
              className={styles.mobileVoterPanelClose}
              onClick={() => setSelectedVoter(null)}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
          {parties.map(party => {
            const pct = Math.round((selectedVoter.partyWeights[party.id] ?? 0) * 100);
            return (
              <div key={party.id} className={styles.mobileVoterRow}>
                <span className={styles.mobileVoterPartyLabel}>{party.name}</span>
                <div className={styles.mobileVoterBarContainer}>
                  <div
                    className={styles.mobileVoterBar}
                    style={{ width: `${pct}%`, backgroundColor: party.color }}
                  />
                </div>
                <span className={styles.mobileVoterPct}>{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {isMobile ? (
        <div
          ref={gridRef}
          className={styles.gridMobile}
          style={mobileGridWidth !== undefined ? { width: mobileGridWidth } : undefined}
        >
          {sorted.map(voter => (
            <VoterDot
              key={voter.id}
              voter={voter}
              parties={parties}
              onSelect={handleDotSelect}
              isSelected={selectedVoter?.id === voter.id}
            />
          ))}
        </div>
      ) : (
        <div
          ref={gridRef}
          className={styles.grid}
          style={{
            gridTemplateRows: `repeat(${numRows}, ${DOT_SIZE}px)`,
            gridAutoColumns: `${DOT_SIZE}px`,
            height: `${gridHeight}px`,
          }}
        >
          {sorted.map(voter => (
            <VoterDot key={voter.id} voter={voter} parties={parties} />
          ))}
        </div>
      )}
    </div>
  );
}
