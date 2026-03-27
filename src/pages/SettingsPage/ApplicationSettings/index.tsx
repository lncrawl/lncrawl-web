import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import type { ConfigSection } from '@/types';
import { stringifyError } from '@/utils/errors';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { SectionEditor } from './SectionEditor';

export const ApplicationSettings: React.FC<any> = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<ConfigSection[]>([]);

  async function fetchConfigs() {
    setError(null);
    try {
      const { data } = await axios.get<ConfigSection[]>('/api/admin/configs');
      setSections(data);
    } catch (err) {
      setError(stringifyError(err, 'Failed to load configuration'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConfigs();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState title={error} onRetry={fetchConfigs} />;
  }

  return <SectionEditor sections={sections} onReload={fetchConfigs} />;
};
