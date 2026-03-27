import { AdminActions } from '@/pages/SettingsPage/AdminActions';
import { ApplicationSettings } from '@/pages/SettingsPage/ApplicationSettings';
import { ReaderSettings } from '@/pages/SettingsPage/ReaderSettings';
import { Auth } from '@/store/_auth';
import { SettingOutlined } from '@ant-design/icons';
import { Collapse, Typography, type CollapseProps } from 'antd';
import { useSelector } from 'react-redux';
import { NotificationSettings } from './NotificationSettings';

export const SettingsPage: React.FC<any> = () => {
  const isLocalUser = useSelector(Auth.select.isLocal);
  const isAdmin = useSelector(Auth.select.isAdmin);

  const items: CollapseProps['items'] = [
    ...(isAdmin
      ? [
          {
            key: 'admin-actions',
            label: 'Admin actions',
            children: <AdminActions />,
          },
        ]
      : []),
    ...(isLocalUser
      ? []
      : [
          {
            key: 'notifications',
            label: 'Notifications',
            children: <NotificationSettings />,
          },
        ]),
    {
      key: 'reader',
      label: 'Reader',
      children: <ReaderSettings />,
    },
    ...(isAdmin
      ? [
          {
            key: 'backend',
            label: 'Backend',
            children: <ApplicationSettings />,
          },
        ]
      : []),
  ];

  const allKeys = items.map((x) => String(x.key)).filter(Boolean);

  return (
    <>
      <Typography.Title level={2}>
        <SettingOutlined /> Settings
      </Typography.Title>

      <Collapse defaultActiveKey={allKeys} items={items} />
    </>
  );
};
