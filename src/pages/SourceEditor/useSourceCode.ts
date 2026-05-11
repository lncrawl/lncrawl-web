import type { SourceItem } from '@/types';
import { stringifyError } from '@/utils/errors';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

export function useSourceCode(domain?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [code, setCode] = useState<string>();
  const [source, setSource] = useState<SourceItem>();
  const [refreshId, setRefreshId] = useState<number>(0);

  useEffect(() => {
    setCode(undefined);
    setError(undefined);
    setSource(undefined);
    if (!domain) {
      setError('No domain provided');
      return;
    }
    async function fetchSource() {
      const { data } = await axios.get<SourceItem>(`/api/source/${domain}`);
      setSource(data);
    }
    async function fetchCode() {
      const { data } = await axios.get<string>(`/api/source/${domain}/code`);
      setCode(data);
    }
    async function fetch() {
      try {
        setLoading(true);
        await Promise.all([fetchSource(), fetchCode()]);
      } catch (err) {
        setError(stringifyError(err));
      } finally {
        setLoading(false);
      }
    }
    queueMicrotask(fetch);
  }, [domain, refreshId]);

  const refresh = useCallback(() => {
    setRefreshId((v) => v + 1);
  }, []);

  return { source, code, loading, error, refresh };
}
