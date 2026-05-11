import {
  BookOutlined,
  ClearOutlined,
  LoginOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { Button, Flex, Input, Select, Space } from 'antd';
import { sortedUniqBy } from 'lodash-es';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getLanguageLabel } from './utils';

type TabKey = 'active' | 'used' | 'disabled';
type SortBy = 'domain' | 'total_novels' | 'total_commits' | 'version';
type SortOrder = 'asc' | 'desc';

export type SourceFilterState = {
  tab: TabKey;
  search?: string;
  language?: string;
  sortBy?: SortBy;
  sortOrder: SortOrder;
  features: {
    has_manga?: boolean;
    has_mtl?: boolean;
    can_search?: boolean;
    can_login?: boolean;
  };
};

const defaultSortOrder: Record<SortBy, SortOrder> = {
  domain: 'asc',
  total_novels: 'desc',
  total_commits: 'desc',
  version: 'desc',
};

export const SupportedSourceFilter: React.FC<{
  value: SourceFilterState;
  onChange: (f: SourceFilterState) => void;
  languages: string[];
}> = ({ value: filter, onChange: setFilter, languages }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sortByOptions = [
    { value: 'domain', label: 'Domain' },
    { value: 'total_novels', label: 'Total Novels' },
    { value: 'total_commits', label: 'Total Commits' },
    { value: 'version', label: 'Version' },
  ];

  const languageOptions = useMemo(() => {
    const options = languages
      .map((lang) => ({
        value: lang,
        label: getLanguageLabel(lang),
      }))
      .filter((x) => x.label !== '')
      .sort((a, b) => a.label!.localeCompare(b.label!));
    return sortedUniqBy(options, 'label');
  }, [languages]);

  const toggleFeature = (feature: keyof SourceFilterState['features']) => {
    setFilter({
      ...filter,
      features: {
        ...filter.features,
        [feature]: !filter.features[feature],
      },
    });
  };

  return (
    <Flex align="center" gap={5} wrap>
      {/* Search */}
      <Input.Search
        defaultValue={filter.search}
        onClear={() => setFilter({ ...filter, search: '' })}
        onSearch={(search) => setFilter({ ...filter, search })}
        allowClear
        placeholder="Search by URL"
        style={{ flex: 2, minWidth: 250 }}
      />

      {/* Sort */}
      <Select
        virtual={false}
        placeholder="Sort by"
        options={sortByOptions}
        value={filter.sortBy}
        prefix={
          filter.sortOrder === 'asc' ? (
            <SortAscendingOutlined />
          ) : (
            <SortDescendingOutlined />
          )
        }
        onClear={() => {
          setFilter({
            ...filter,
            sortBy: 'version',
            sortOrder: 'desc',
          });
        }}
        onSelect={(value) => {
          if (filter.sortBy === value) {
            setFilter({
              ...filter,
              sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc',
            });
          } else {
            setFilter({
              ...filter,
              sortBy: value,
              sortOrder: defaultSortOrder[value],
            });
          }
        }}
        allowClear={filter.sortBy !== 'version' || filter.sortOrder !== 'desc'}
        style={{ flex: 1, minWidth: 150 }}
      />

      {/* Language filter */}
      <Select
        virtual={false}
        allowClear
        placeholder="Language"
        options={languageOptions}
        value={filter.language}
        onChange={(val) => setFilter({ ...filter, language: val })}
        style={{ flex: 1, minWidth: 150 }}
      />

      {/* Feature filters */}
      <Space size={0} wrap>
        <Button
          type={filter.features.has_manga ? 'primary' : 'default'}
          onClick={() => toggleFeature('has_manga')}
          icon={<BookOutlined />}
          style={{ outline: 'none', borderRadius: 0 }}
        >
          Manga
        </Button>
        <Button
          type={filter.features.has_mtl ? 'primary' : 'default'}
          onClick={() => toggleFeature('has_mtl')}
          icon={<TranslationOutlined />}
          style={{ outline: 'none', borderRadius: 0 }}
        >
          MTL
        </Button>
        <Button
          type={filter.features.can_search ? 'primary' : 'default'}
          onClick={() => toggleFeature('can_search')}
          icon={<SearchOutlined />}
          style={{ outline: 'none', borderRadius: 0 }}
        >
          Search
        </Button>
        <Button
          type={filter.features.can_login ? 'primary' : 'default'}
          onClick={() => toggleFeature('can_login')}
          icon={<LoginOutlined />}
          style={{ outline: 'none', borderRadius: 0 }}
        >
          Login
        </Button>
      </Space>

      {/* Clear Filters */}
      {searchParams.size > 0 && (
        <Button
          shape="round"
          icon={<ClearOutlined />}
          onClick={() => setSearchParams({})}
        />
      )}
    </Flex>
  );
};
