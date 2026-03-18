import { useEffect, useCallback } from 'react';
import type { SimConfig, VotingMethod, Party } from '../types';
import { DEFAULT_PARTIES, PARTY_COLORS } from '../data/parties';

export interface UrlState {
  config: SimConfig;
  parties: Party[];
}

function parseUrlParams(): Partial<UrlState> {
  const params = new URLSearchParams(window.location.search);

  const config: Partial<SimConfig> = {};
  const method = params.get('method') as VotingMethod | null;
  if (method) config.method = method;

  const numParties = params.get('parties');
  if (numParties) config.numPartiesOnBallot = parseInt(numParties, 10);

  const candidates = params.get('candidates');
  if (candidates) config.candidatesPerParty = parseInt(candidates, 10);

  let parties: Party[] | undefined;
  const partyIds = params.get('partyIds');
  const leanWeights = params.get('leanWeights');
  const partyNames = params.get('partyNames');
  const partyColors = params.get('partyColors');

  if (partyIds) {
    const ids = partyIds.split(',');
    // Names/colors are stored as plain strings (URLSearchParams handles encoding)
    const names = partyNames
      ? partyNames.split('|')
      : ids.map(id => DEFAULT_PARTIES.find(p => p.id === id)?.name ?? `${id} Party`);
    const colors = partyColors
      ? partyColors.split(',')
      : ids.map((id, i) => DEFAULT_PARTIES.find(p => p.id === id)?.color ?? PARTY_COLORS[i % PARTY_COLORS.length] ?? '#888');
    const weights = leanWeights ? leanWeights.split(',').map(Number) : ids.map(() => 1);

    parties = ids.map((id, i) => ({
      id,
      name: names[i] ?? id,
      color: colors[i] ?? '#888',
      leanWeight: weights[i] ?? 1,
    }));
  }

  return {
    ...(Object.keys(config).length > 0 ? { config: config as SimConfig } : {}),
    ...(parties ? { parties } : {}),
  };
}

export function loadUrlState(
  defaultConfig: SimConfig,
  defaultParties: Party[],
): UrlState {
  const parsed = parseUrlParams();
  return {
    config: { ...defaultConfig, ...parsed.config },
    parties: parsed.parties ?? defaultParties,
  };
}

export function useUrlSync(config: SimConfig, parties: Party[]) {
  const sync = useCallback(() => {
    const params = new URLSearchParams();
    params.set('method', config.method);
    params.set('parties', String(config.numPartiesOnBallot));
    params.set('candidates', String(config.candidatesPerParty));
    params.set('partyIds', parties.map(p => p.id).join(','));
    params.set('leanWeights', parties.map(p => p.leanWeight.toFixed(2)).join(','));
    // Use | as delimiter for names (avoids comma conflicts); URLSearchParams encodes it
    params.set('partyNames', parties.map(p => p.name).join('|'));
    params.set('partyColors', parties.map(p => p.color).join(','));

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [config, parties]);

  useEffect(() => {
    sync();
  }, [sync]);
}
