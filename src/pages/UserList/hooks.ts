import type { Paginated, User } from '@/types';
import { stringifyError } from '@/utils/errors';
import axios from 'axios';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface SearchParams {
  page?: number;
  search?: string;
  referrer?: string;
  verified?: boolean | null;
  active?: boolean | null;
}

export function useUserList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [refreshId, setRefreshId] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState<User[]>([]);

  const search = useMemo(
    () => searchParams.get('search') || '',
    [searchParams]
  );

  const referrerId = useMemo(
    () => searchParams.get('referrer') || undefined,
    [searchParams]
  );

  const isVerified = useMemo(() => {
    const v = searchParams.get('verified');
    if (typeof v === 'string') {
      return v === '1' || v === 'true';
    }
    return undefined;
  }, [searchParams]);

  const isActive = useMemo(() => {
    const v = searchParams.get('active');
    if (typeof v === 'string') {
      return v === '1' || v === 'true';
    }
    return undefined;
  }, [searchParams]);

  const perPage = 10;
  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setError(undefined);
      try {
        const offset = (currentPage - 1) * perPage;
        const { data } = await axios.get<Paginated<User>>('/api/users', {
          params: {
            search,
            offset,
            limit: perPage,
            referrer: referrerId,
            is_verified: isVerified,
            is_active: isActive,
          },
        });
        setTotal(data.total);
        setUsers(data.items);
      } catch (err: any) {
        setError(stringifyError(err));
      } finally {
        setLoading(false);
      }
    };

    const tid = setTimeout(fetchUsers, 50);
    return () => clearTimeout(tid);
  }, [search, currentPage, referrerId, isVerified, isActive, refreshId]);

  const refresh = useCallback(() => {
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
        if (typeof updates.verified === 'boolean') {
          next.set('verified', updates.verified ? '1' : '0');
        } else if (updates.verified === null) {
          next.delete('verified');
        }
        if (typeof updates.active === 'boolean') {
          next.set('active', updates.active ? '1' : '0');
        } else if (updates.active === null) {
          next.delete('active');
        }
        return next;
      });
    }, 100);
  }, [setSearchParams]);

  return {
    search,
    perPage,
    currentPage,
    users,
    total,
    loading,
    error,
    referrerId,
    isVerified,
    isActive,
    refresh,
    updateParams,
  };
}
