import { Config } from '@/store/_config';
import type { Novel, Paginated } from '@/types';
import { stringifyError } from '@/utils/errors';
import { Grid } from 'antd';
import axios from 'axios';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

interface SearchParams {
  page?: number;
  search?: string;
  domain?: string;
}

export function useNovelList() {
  const breakpoint = Grid.useBreakpoint();
  const [searchParams, setSearchParams] = useSearchParams();

  const [refreshId, setRefreshId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [total, setTotal] = useState(0);
  const [novels, setNovels] = useState<Novel[]>([]);

  const search = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  );

  const domain = useMemo(
    () => searchParams.get('domain') || '',
    [searchParams]
  );

  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );

  const pageSizeXl = useSelector(Config.select.novelListPageSizeXl);
  const pageSizeLg = useSelector(Config.select.novelListPageSizeLg);
  const pageSizeSm = useSelector(Config.select.novelListPageSizeSm);
  const listFetchDelayMs = useSelector(Config.select.listFetchDelayMs);
  const listFilterDebounceMs = useSelector(Config.select.listFilterDebounceMs);

  const perPage = useMemo(() => {
    if (breakpoint.xl) {
      return pageSizeXl;
    }
    if (breakpoint.lg) {
      return pageSizeLg;
    }
    return pageSizeSm;
  }, [breakpoint.xl, breakpoint.lg, pageSizeXl, pageSizeLg, pageSizeSm]);

  const fetchNovels = async (
    search: string,
    domain: string,
    page: number,
    limit: number
  ) => {
    setError(undefined);
    try {
      const offset = (page - 1) * limit;
      const { data } = await axios.get<Paginated<Novel>>('/api/novels', {
        params: { search, offset, limit, domain },
      });
      setTotal(data.total);
      setNovels(data.items);
    } catch (err: any) {
      setError(stringifyError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tid = setTimeout(() => {
      fetchNovels(search, domain, currentPage, perPage);
    }, listFetchDelayMs);
    return () => clearTimeout(tid);
  }, [search, domain, currentPage, perPage, refreshId, listFetchDelayMs]);

  const refresh = useCallback(() => {
    setLoading(true);
    setRefreshId((v) => v + 1);
  }, []);

  const updateParams: (updates: SearchParams) => any = useMemo(() => {
    return debounce((updates: SearchParams) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (updates.page && updates.page !== 1) {
          next.set('page', String(updates.page));
        } else if (typeof updates.page !== 'undefined') {
          next.delete('page');
        }
        if (updates.search) {
          next.set('search', String(updates.search));
        } else if (typeof updates.search !== 'undefined') {
          next.delete('search');
        }
        if (updates.domain) {
          next.set('domain', String(updates.domain));
        } else if (typeof updates.domain !== 'undefined') {
          next.delete('domain');
        }
        return next;
      });
    }, listFilterDebounceMs);
  }, [setSearchParams, listFilterDebounceMs]);

  return {
    search,
    perPage,
    currentPage,
    domain,
    novels,
    total,
    loading,
    error,
    refresh,
    updateParams,
  };
}

export type NovelListHook = ReturnType<typeof useNovelList>;
