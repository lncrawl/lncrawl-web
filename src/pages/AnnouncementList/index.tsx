import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import type { Announcement } from '@/types';
import { stringifyError } from '@/utils/errors';
import { NotificationOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Flex, Grid, Typography, message } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { AnnouncementListItemCard } from './AnnouncementListItemCard';
import { useAnnouncementModal } from './useAnnouncementModal';

export const AnnouncementListPage: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const [messageApi, messageContext] = message.useMessage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<Announcement[]>('/api/announcement');
      setAnnouncements(res.data);
    } catch (err) {
      setError(stringifyError(err));
      messageApi.error(stringifyError(err, 'Failed to load announcements'));
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const [openModal, modalContext] = useAnnouncementModal(fetchAll);

  const toggleActive = async (a: Announcement) => {
    try {
      await axios.patch(`/api/announcement/${a.id}`, {
        is_active: !a.is_active,
      });
      messageApi.success(a.is_active ? 'Deactivated' : 'Activated');
      fetchAll();
    } catch (err) {
      messageApi.error(stringifyError(err, 'Failed to update'));
    }
  };

  const bumpVersion = async (a: Announcement) => {
    try {
      await axios.patch(`/api/announcement/${a.id}`, { bump_version: true });
      messageApi.success('Version bumped — users will see this again');
      fetchAll();
    } catch (err) {
      messageApi.error(stringifyError(err, 'Failed to bump version'));
    }
  };

  const handleDelete = async (a: Announcement) => {
    try {
      await axios.delete(`/api/announcement/${a.id}`);
      messageApi.success('Deleted');
      fetchAll();
    } catch (err) {
      messageApi.error(stringifyError(err, 'Failed to delete'));
      throw err;
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load announcements"
        error={error}
        onRetry={fetchAll}
      />
    );
  }

  return (
    <>
      {modalContext}
      {messageContext}

      <Flex
        wrap
        align="center"
        justify="space-between"
        gap="middle"
        style={{ marginBottom: 16, marginTop: 24 }}
      >
        <Typography.Title level={2} style={{ margin: 0 }}>
          <NotificationOutlined style={{ color: '#52c41a' }} /> Announcements
        </Typography.Title>
        <Button
          type="primary"
          block={!screens.md}
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          New Announcement
        </Button>
      </Flex>

      {!announcements.length && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            announcements.length
              ? 'No announcements match your filters'
              : 'No announcements yet'
          }
        />
      )}

      {announcements.map((a) => (
        <AnnouncementListItemCard
          key={a.id}
          announcement={a}
          onEdit={() => openModal(a)}
          onToggleActive={() => toggleActive(a)}
          onBumpVersion={() => bumpVersion(a)}
          onDelete={() => handleDelete(a)}
        />
      ))}
    </>
  );
};

export default AnnouncementListPage;
