import type { Party } from '../types';

export const DEFAULT_PARTIES: Party[] = [
  { id: 'blue',   name: 'Blue Party',   color: '#3b82f6', leanWeight: 1 },
  { id: 'red',    name: 'Red Party',    color: '#ef4444', leanWeight: 1 },
  { id: 'green',  name: 'Green Party',  color: '#22c55e', leanWeight: 1 },
  { id: 'purple', name: 'Purple Party', color: '#a855f7', leanWeight: 1 },
  { id: 'orange', name: 'Orange Party', color: '#f97316', leanWeight: 1 },
];

export const PARTY_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#a855f7', '#f97316',
  '#eab308', '#06b6d4', '#ec4899',
];
