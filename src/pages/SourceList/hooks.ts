import { Config } from '@/store/_config';
import type { SourceItem } from '@/types';
import { stringifyError } from '@/utils/errors';
import axios from 'axios';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import type { SourceFilterState } from './SourceListFilter';
import { filterAndSortSources } from './utils';

export function useSourceList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const listFilterDebounceMs = useSelector(Config.select.listFilterDebounceMs);

  const [refreshId, setRefreshId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<SourceItem[]>([]);
  const [filtered, setFiltered] = useState<SourceItem[]>([]);

  const tabKey: SourceFilterState['tab'] = useMemo(
    () => (searchParams.get('tab') || 'active') as SourceFilterState['tab'],
    [searchParams]
  );
  const sortBy: SourceFilterState['sortBy'] = useMemo(
    () =>
      (searchParams.get('order') || 'version') as SourceFilterState['sortBy'],
    [searchParams]
  );
  const sortOrder: SourceFilterState['sortOrder'] = useMemo(
    () => (searchParams.has('desc') ? 'desc' : 'asc'),
    [searchParams]
  );
  const search = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  );
  const language = useMemo(
    () => searchParams.get('lang') || undefined,
    [searchParams]
  );
  const features = useMemo(
    () => (searchParams.get('feat') || '').split(','),
    [searchParams]
  );

  const filter: SourceFilterState = {
    tab: tabKey,
    sortBy,
    sortOrder,
    search,
    language,
    features: {
      has_manga: features.includes('manga'),
      has_mtl: features.includes('mtl'),
      can_login: features.includes('search'),
      can_search: features.includes('login'),
    },
  };

  const setFilter = useMemo(
    () =>
      debounce((updates: SourceFilterState) => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (updates.tab !== 'active') {
            next.set('tab', updates.tab);
          } else {
            next.delete('tab');
          }
          if (updates.search) {
            next.set('search', updates.search);
          } else {
            next.delete('search');
          }
          if (updates.language) {
            next.set('lang', updates.language);
          } else {
            next.delete('lang');
          }
          if (updates.sortOrder === 'desc') {
            next.set('desc', 'true');
          } else {
            next.delete('desc');
          }
          if (updates.sortBy && updates.sortBy !== 'version') {
            next.set('order', updates.sortBy);
          } else {
            next.delete('order');
          }
          const features = [
            updates.features.has_manga && 'manga',
            updates.features.has_mtl && 'mtl',
            updates.features.can_search && 'search',
            updates.features.can_login && 'login',
          ].filter(Boolean);
          if (features.length > 0) {
            next.set('feat', features.join(','));
          } else {
            next.delete('feat');
          }
          return next;
        });
      }, listFilterDebounceMs),
    [setSearchParams, listFilterDebounceMs]
  );

  useEffect(() => {
    async function fetch() {
      setError(undefined);
      try {
        const res = await axios.get<SourceItem[]>('/api/sources');
        setData(res.data);
      } catch (err) {
        setError(stringifyError(err));
      } finally {
        setLoading(false);
      }
    }
    queueMicrotask(fetch);
  }, [refreshId]);

  const refresh = useCallback(() => {
    setRefreshId((v) => v + 1);
  }, []);

  const languages = useMemo(
    () => Array.from(new Set(data.map((x) => x.language))).sort(),
    [data]
  );

  const filterJson = JSON.stringify(filter);
  useEffect(() => {
    queueMicrotask(() => {
      setFiltered(filterAndSortSources(data, filter));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filterJson]);

  return {
    loading,
    error,
    languages,
    sources: filtered,
    refresh,
    filter,
    setFilter,
  };
}
