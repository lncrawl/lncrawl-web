import { ReaderSettings } from '@/pages/SettingsPage/ReaderSettings';
import { Auth } from '@/store/_auth';
import { SettingOutlined } from '@ant-design/icons';
import { Collapse, Typography, type CollapseProps } from 'antd';
import { useSelector } from 'react-redux';
import { NotificationSettings } from './NotificationSettings';

export const SettingsPage: React.FC<any> = () => {
  const isLocalUser = useSelector(Auth.select.isLocal);

  const items: CollapseProps['items'] = [
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
