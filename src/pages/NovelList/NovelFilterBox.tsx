import { Favicon } from '@/components/Favicon';
import { Flex, Input, message, Select, Space, Typography } from 'antd';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { type NovelListHook } from './hooks';

export const NovelFilterBox: React.FC<
  Pick<NovelListHook, 'search' | 'domain' | 'updateParams'>
> = ({ search: initialSearch, domain: initialDomain, updateParams }) => {
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadSources = async () => {
      try {
        setLoading(true);
        const { data } =
          await axios.get<Record<string, number>>('/api/novel/domains');
        setSources(data);
      } catch {
        message.error('Failed to load sources');
      } finally {
        setLoading(false);
      }
    };
    loadSources();
  }, []);

  const sourceOptions = useMemo(() => {
    return Object.entries(sources)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([domain, total]) => ({
        value: domain,
        label: (
          <Space size="small">
            <Favicon url={`https://${domain}`} />
            {domain}
            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
              ({total} novels)
            </Typography.Text>
          </Space>
        ),
      }));
  }, [sources]);

  return (
    <Flex align="center" justify="space-between" gap="8px" wrap>
      {/* Domain Select */}
      <Select
        loading={loading}
        options={sourceOptions}
        defaultValue={initialDomain || null}
        onChange={(value) => updateParams({ domain: value || '', page: 1 })}
        placeholder="Select a domain"
        size="large"
        allowClear
        virtual={false}
        style={{ flex: 1, minWidth: 250 }}
        labelRender={({ value }) => value}
        showSearch={{ autoClearSearchValue: true }}
      />

      {/* Search Input */}
      <Input.Search
        defaultValue={initialSearch}
        onClear={() => updateParams({ search: '', page: 1 })}
        onSearch={(search) => updateParams({ search, page: 1 })}
        placeholder="Search novels"
        allowClear
        size="large"
        style={{ flex: 3, minWidth: 300 }}
      />
    </Flex>
  );
};
