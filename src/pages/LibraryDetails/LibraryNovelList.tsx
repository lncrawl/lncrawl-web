import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { Config } from '@/store/_config';
import type { Job, Library, Novel, Paginated } from '@/types';
import { stringifyError } from '@/utils/errors';
import { ReloadOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Empty,
  Flex,
  message,
  Pagination,
  Row,
  Space,
  Typography,
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { NovelListItemCard } from '../NovelList/NovelListItemCard';
import { RemoveLibraryNovelButton } from './RemoveLibraryNovelButton';

export const LibraryNovelList: React.FC<{
  library: Library;
  isOwner: boolean;
}> = ({ library, isOwner }) => {
  const navigate = useNavigate();
  const pageSize = useSelector(Config.select.libraryNovelListPageSize);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [novels, setNovels] = useState<Novel[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    const loadNovels = async () => {
      try {
        const { data } = await axios.get<Paginated<Novel>>(
          `/api/library/${library.id}/novels`,
          {
            params: {
              limit: pageSize,
              offset: (page - 1) * pageSize,
            },
          }
        );
        setTotal(data.total);
        setNovels(data.items || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load novels');
      } finally {
        setLoading(false);
      }
    };
    loadNovels();
  }, [library.id, refresh, page, pageSize]);

  const handleRefreshAll = async () => {
    try {
      const { data: job } = await axios.post<Job>(
        '/api/job/create/fetch-novels',
        {
          urls: novels.map((novel) => novel.url),
        }
      );
      navigate(`/job/${job.id}`);
    } catch (err) {
      message.error(stringifyError(err));
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load novels"
        onRetry={() => setRefresh((v) => v + 1)}
      />
    );
  }

  return (
    <>
      <Flex align="center" justify="space-between" style={{ marginTop: 15 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          📚 Novels{' '}
          <sup>
            <Typography.Text type="secondary">
              ({total || 0} total)
            </Typography.Text>
          </sup>
        </Typography.Title>
        {total > 0 && (
          <Button icon={<ReloadOutlined />} onClick={handleRefreshAll}>
            Refresh All
          </Button>
        )}
      </Flex>

      <Divider size="small" />

      <Space vertical style={{ width: '100%' }} size="middle">
        {novels.length ? (
          <Row gutter={[12, 12]}>
            {novels.map((novel) => (
              <Col key={novel.id} xs={12} sm={8} lg={6} xl={4}>
                <div style={{ position: 'relative' }}>
                  {isOwner && (
                    <RemoveLibraryNovelButton
                      novel={novel}
                      library={library}
                      onRemoved={() => setRefresh((v) => v + 1)}
                    />
                  )}
                  <NovelListItemCard novel={novel} />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No novels yet"
          />
        )}

        <Pagination
          current={page}
          total={total || 0}
          pageSize={pageSize}
          onChange={(p) => setPage(p)}
          hideOnSinglePage
        />
      </Space>
    </>
  );
};
