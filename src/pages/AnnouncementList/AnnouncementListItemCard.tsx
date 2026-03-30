import type { Announcement } from '@/types';
import { formatFromNow } from '@/utils/time';
import { CalendarOutlined } from '@ant-design/icons';
import { Card, Divider, Flex, Grid, Space, Tag, theme, Typography } from 'antd';
import { AnnouncementListItemActions } from './AnnouncementListItemActions';
import { getAnnouncementTagColor, getAnnouncementTypeLabel } from './utils';

function typeBorderColor(
  type: string,
  token: ReturnType<typeof theme.useToken>['token']
): string {
  switch (type) {
    case 'warning':
      return token.colorWarning;
    case 'error':
      return token.colorError;
    case 'success':
      return token.colorSuccess;
    case 'info':
    default:
      return token.colorInfo;
  }
}

export const AnnouncementListItemCard: React.FC<{
  announcement: Announcement;
  onEdit: () => void;
  onToggleActive: () => void;
  onBumpVersion: () => void;
  onDelete: () => void | Promise<void>;
}> = ({ announcement: a, onEdit, onToggleActive, onBumpVersion, onDelete }) => {
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();

  const leftColor = typeBorderColor(a.type, token);
  const rightColor = a.is_active
    ? token.colorSuccess
    : token.colorBorderSecondary;

  return (
    <Card
      style={{
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        borderLeft: `4px solid ${leftColor}`,
        borderRight: `4px solid ${rightColor}`,
      }}
      styles={{
        body: {
          padding: lg ? '14px 20px' : '12px 14px',
        },
      }}
    >
      <Flex justify="space-between" wrap gap="small">
        <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Typography.Title
            level={4}
            ellipsis
            style={{
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {a.title}
          </Typography.Title>
          <Flex gap="small" wrap>
            <Tag color={getAnnouncementTagColor(a.type)}>
              {getAnnouncementTypeLabel(a.type)}
            </Tag>
            <Tag color={a.is_active ? 'success' : 'default'}>
              {a.is_active ? 'Active' : 'Inactive'}
            </Tag>
            <Tag>v{a.version}</Tag>
          </Flex>
        </Flex>

        <AnnouncementListItemActions
          announcement={a}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onBumpVersion={onBumpVersion}
          onDelete={onDelete}
        />
      </Flex>

      <Typography.Paragraph
        ellipsis={{ rows: 3 }}
        type={a.message ? undefined : 'secondary'}
        style={{
          margin: '10px 0 0',
          color: token.colorTextSecondary,
          whiteSpace: 'pre-wrap',
        }}
      >
        {a.message || 'No message provided'}
      </Typography.Paragraph>

      <Space
        wrap
        size={0}
        style={{ marginTop: 10 }}
        separator={<Divider vertical />}
      >
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          <CalendarOutlined /> {formatFromNow(a.created_at)}
        </Typography.Text>
      </Space>
    </Card>
  );
};
