import { Editor } from '@/store/_editor';
import type { SourceItem } from '@/types';
import { stringifyError } from '@/utils/errors';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export function useSourceCode(domain?: string) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [refreshId, setRefreshId] = useState<number>(0);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(undefined);
      if (!domain) return;
      try {
        const [source, code] = await Promise.all([
          axios
            .get<SourceItem>(`/api/source/${domain}`)
            .then(({ data }) => data),
          axios
            .get<string>(`/api/source/${domain}/code`)
            .then(({ data }) => data),
        ]);
        dispatch(Editor.action.setCurrent({ source, code }));
      } catch (err) {
        setError(stringifyError(err));
        dispatch(Editor.action.setCurrent(null));
      } finally {
        setLoading(false);
      }
    }
    queueMicrotask(fetch);
  }, [domain, dispatch, refreshId]);

  const refresh = useCallback(() => {
    setRefreshId((v) => v + 1);
  }, []);

  return { loading, error, refresh };
}
