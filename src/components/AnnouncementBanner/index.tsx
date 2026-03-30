import type { Announcement } from '@/types';
import { CloseOutlined } from '@ant-design/icons';
import { Alert, Flex, Space, Typography } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import MarkdownView from 'react-markdown';
import styles from './AnnouncementBanner.module.scss';

const DISMISSED_KEY = 'dismissed_announcements';

function getDismissedVersions(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
  } catch {
    return {};
  }
}

function dismissAnnouncement(id: string, version: number) {
  const dismissed = getDismissedVersions();
  dismissed[id] = version;
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
}

function isAnnouncementDismissed(a: Announcement): boolean {
  const dismissed = getDismissedVersions();
  return dismissed[a.id] >= a.version;
}

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get<Announcement[]>('/api/announcement/active')
      .then((res) => {
        if (!cancelled) {
          setAnnouncements(res.data.filter((a) => !isAnnouncementDismissed(a)));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = useCallback((a: Announcement) => {
    dismissAnnouncement(a.id, a.version);
    setAnnouncements((prev) => prev.filter((x) => x.id !== a.id));
  }, []);

  if (!announcements.length) {
    return null;
  }

  return (
    <Flex vertical gap={6} align="stretch">
      {announcements.map((a) => (
        <Alert
          banner
          showIcon
          key={a.id}
          type={a.type}
          closable={{
            closeIcon: <CloseOutlined />,
            onClose: () => handleClose(a),
          }}
          styles={{
            icon: { fontSize: 24 },
            title: { zoom: 0.925 },
            root: { padding: '8px 16px' },
            section: { paddingLeft: '16px' },
          }}
          title={
            <Space.Compact vertical>
              <Typography.Text strong>{a.title}</Typography.Text>
              <Typography.Text type="secondary" className={styles.message}>
                <MarkdownView>{a.message}</MarkdownView>
              </Typography.Text>
            </Space.Compact>
          }
        />
      ))}
    </Flex>
  );
};
