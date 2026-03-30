import type { Announcement } from '@/types';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Modal } from 'antd';

export const AnnouncementListItemActions: React.FC<{
  announcement: Announcement;
  onEdit: () => void;
  onToggleActive: () => void;
  onBumpVersion: () => void;
  onDelete: () => void | Promise<void>;
}> = ({ announcement: a, onEdit, onToggleActive, onBumpVersion, onDelete }) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => onEdit(),
    },
    {
      key: 'toggle',
      icon: a.is_active ? <StopOutlined /> : <CheckCircleOutlined />,
      label: a.is_active ? 'Deactivate' : 'Activate',
      onClick: () => onToggleActive(),
    },
    {
      key: 'bump',
      icon: <ReloadOutlined />,
      label: 'Re-show to users who dismissed',
      onClick: () => onBumpVersion(),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Delete announcement?',
          content: `"${a.title}" will be permanently removed.`,
          okText: 'Delete',
          okType: 'danger',
          okButtonProps: { danger: true },
          onOk: () => onDelete(),
        });
      },
    },
  ];

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{ items: menuItems }}
      >
        <Button
          type="text"
          size="large"
          shape="circle"
          icon={<MoreOutlined />}
          aria-label="More actions"
        />
      </Dropdown>
    </div>
  );
};
