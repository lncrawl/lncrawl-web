import type { User } from '@/types';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, theme, type AvatarProps } from 'antd';
import md5 from 'spark-md5';

const getGravatarUrl = (email: string, size = 200) => {
  const hash = md5.hash(String(email).trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=${size}`;
};

type UserAvatarProps = AvatarProps & {
  user?: User | null;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  ...avatarProps
}) => {
  const { token } = theme.useToken();
  if (!user) {
    return null;
  }
  return (
    <Avatar
      key={user.email}
      size={72}
      {...avatarProps}
      alt={user.name || user.email}
      src={getGravatarUrl(user.email)}
      icon={<UserOutlined style={{ fontSize: 'inherit' }} />}
      style={{
        backgroundColor: token.colorPrimary,
        ...avatarProps.style,
      }}
    />
  );
};
