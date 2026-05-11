import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { Auth } from '@/store/_auth';
import { stringifyError } from '@/utils/errors';
import { formatDate, parseDate } from '@/utils/time';
import { FileDoneOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Flex, message, Typography } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSourceList } from './hooks';
import { SupportedSourceFilter } from './SourceListFilter';
import { SourceListTabSelector } from './SourceListTabSelector';
import { SourceListView } from './SourceListView';

export const SourceListPage: React.FC<any> = () => {
  const ctx = useSourceList();
  const isAdmin = useSelector(Auth.select.isAdmin);
  const [messageApi, contextHolder] = message.useMessage();

  const handleUpdateSources = async () => {
    try {
      const { data } = await axios.post<string>('/api/admin/update-sources');
      const updatedAt = parseDate(Number(data) * 1000);
      messageApi.info(`Updated sources to v${data} (${formatDate(updatedAt)})`);
      ctx.refresh();
    } catch (err) {
      messageApi.error(stringifyError(err));
    }
  };

  return (
    <>
      {contextHolder}

      <Flex align="baseline" justify="space-between" gap="8px" wrap>
        <Typography.Title level={2} style={{ marginBottom: 5 }}>
          <FileDoneOutlined style={{ color: '#0f0' }} /> Supported Sources
        </Typography.Title>
        {isAdmin && (
          <Button
            shape="round"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleUpdateSources}
          >
            Update Sources
          </Button>
        )}
      </Flex>

      <Divider size="small" />

      <SupportedSourceFilter
        languages={ctx.languages}
        value={ctx.filter}
        onChange={ctx.setFilter}
      />

      <SourceListTabSelector
        filter={ctx.filter}
        onChange={ctx.setFilter}
        totalItems={ctx.sources.length}
      />

      <Divider size="small" style={{ marginTop: 4 }} />

      <div>
        {ctx.loading ? (
          <LoadingState />
        ) : ctx.error ? (
          <ErrorState
            error={ctx.error}
            title="Failed to load supported sources"
            onRetry={ctx.refresh}
          />
        ) : !ctx.sources?.length ? (
          <Flex align="center" justify="center" style={{ height: '100%' }}>
            <Empty
              description="No sources available"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Flex>
        ) : (
          <SourceListView
            sources={ctx.sources}
            disabled={ctx.filter.tab === 'disabled'}
          />
        )}
      </div>
    </>
  );
};
