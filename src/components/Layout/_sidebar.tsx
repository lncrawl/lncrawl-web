import { PrivacyPolicy } from '@/pages/Signup/PrivacyPolicy';
import { TermsOfService } from '@/pages/Signup/TermsOfService';
import { Auth } from '@/store/_auth';
import {
  BookOutlined,
  CommentOutlined,
  ControlOutlined,
  DeploymentUnitOutlined,
  FileDoneOutlined,
  FolderOpenOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Divider, Flex, Layout, Menu, theme } from 'antd';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { DonateButton } from '../DonateButton';
import { UserInfoCard } from '../UserInfoCard';
import { LocalUserInfoCard } from './_header';

function getClassName(currentPath: string, path: string): string | undefined {
  if (currentPath === path) {
    return 'ant-menu-item-selected';
  }
  return undefined;
}

export const MainLayoutSidebar: React.FC<{
  fullWidth?: boolean;
  style?: React.CSSProperties;
}> = ({ fullWidth, style }) => {
  const { token } = theme.useToken();
  const { pathname: currentPath } = useLocation();
  const isAdmin = useSelector(Auth.select.isAdmin);
  const isLocalUser = useSelector(Auth.select.isLocal);

  return (
    <Layout.Sider
      theme="light"
      collapsible={false}
      width={fullWidth ? '100%' : 250}
      style={{
        ...style,
        height: fullWidth ? '100%' : '100vh',
      }}
    >
      <Flex
        vertical
        style={{
          height: '100%',
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Menu
          key={currentPath}
          mode="inline"
          inlineIndent={15}
          subMenuOpenDelay={0}
          openKeys={['admin']}
          style={{
            flex: 1,
            overflow: 'auto',
            borderRight: 'none',
            userSelect: 'none',
          }}
          items={[
            {
              type: 'group' as const,
              key: 'user',
              label: isLocalUser ? <LocalUserInfoCard /> : <UserInfoCard />,
              style: {
                background: 'none',
                height: 'fit-content',
              },
            },
            { type: 'divider' as const },
            {
              key: '/',
              icon: <DeploymentUnitOutlined />,
              className: getClassName(currentPath, '/'),
              label: <Link to="/">Requests</Link>,
            },
            {
              key: '/novels',
              icon: <BookOutlined />,
              className: getClassName(currentPath, '/novels'),
              label: <Link to="/novels">Novels</Link>,
            },
            {
              key: '/libraries',
              icon: <FolderOpenOutlined />,
              className: getClassName(currentPath, '/libraries'),
              label: <Link to="/libraries">Libraries</Link>,
            },
            {
              key: '/meta/sources',
              icon: <FileDoneOutlined />,
              className: getClassName(currentPath, '/meta/sources'),
              label: <Link to="/meta/sources">Crawlers</Link>,
            },
            ...(isLocalUser
              ? []
              : [
                  {
                    key: '/feedbacks',
                    icon: <CommentOutlined />,
                    className: getClassName(currentPath, '/feedbacks'),
                    label: <Link to="/feedbacks">Feedbacks</Link>,
                  },
                ]),
            { type: 'divider' as const },

            ...(isLocalUser
              ? []
              : [
                  {
                    key: '/profile',
                    icon: <UserOutlined />,
                    className: getClassName(currentPath, '/profile'),
                    label: <Link to="/profile">Account</Link>,
                  },
                ]),
            {
              key: '/settings',
              icon: <SettingOutlined />,
              className: getClassName(currentPath, '/settings'),
              label: <Link to="/settings">Settings</Link>,
            },
            { type: 'divider' as const },
            {
              key: '/tutorial',
              icon: <QuestionCircleOutlined />,
              className: getClassName(currentPath, '/tutorial'),
              label: <Link to="/tutorial">Tutorial</Link>,
            },
            ...(isAdmin && !isLocalUser
              ? [
                  { type: 'divider' as const },
                  {
                    key: 'admin',
                    type: 'submenu' as const,
                    icon: <ControlOutlined />,
                    label: 'Administration',
                    children: [
                      {
                        key: '/admin/announcements',
                        icon: <NotificationOutlined />,
                        className: getClassName(
                          currentPath,
                          '/admin/announcements'
                        ),
                        label: (
                          <Link to="/admin/announcements">Announcements</Link>
                        ),
                      },
                      {
                        key: '/admin/users',
                        icon: <TeamOutlined />,
                        className: getClassName(currentPath, '/admin/users'),
                        label: <Link to="/admin/users">Users</Link>,
                      },
                    ],
                  },
                ]
              : []),
          ]}
        />

        <Divider style={{ margin: 0 }} />
        <Flex
          gap={5}
          align="center"
          justify="center"
          style={{ fontSize: 11, padding: '8px 16px' }}
        >
          <DonateButton />
        </Flex>

        <Divider style={{ margin: 0 }} />
        <Flex
          gap={5}
          align="center"
          justify="center"
          style={{ fontSize: 11, padding: '4px 16px' }}
        >
          <PrivacyPolicy />
          <Divider vertical />
          <TermsOfService />
        </Flex>
      </Flex>
    </Layout.Sider>
  );
};
