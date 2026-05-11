import LncrawlImage from '@/assets/lncrawl.svg';
import { getColorForId } from '@/utils/gradients';
import { Avatar, Flex, theme, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export const LocalUserInfoCard: React.FC<any> = () => {
  const navigate = useNavigate();
  return (
    <Flex
      gap={10}
      vertical
      align="center"
      justify="center"
      style={{
        textAlign: 'center',
        padding: '25px 0 10px 0',
      }}
    >
      <Avatar
        shape="circle"
        src={LncrawlImage}
        size={72}
        style={{
          cursor: 'pointer',
          backgroundColor: '#393949',
          padding: 10,
        }}
        onClick={() => navigate('/')}
      />
      <Typography.Text strong style={{ fontSize: 16 }}>
        Lightnovel Crawler
      </Typography.Text>
    </Flex>
  );
};

export const MobileLayoutHeader: React.FC<any> = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  return (
    <Flex
      gap={5}
      align="center"
      justify="center"
      onClick={() => navigate('/')}
      style={{
        height: 40,
        cursor: 'pointer',
        userSelect: 'none',
        padding: '0 10px',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: getColorForId(location.pathname, { start: 10, stop: 30 }),
      }}
    >
      <Avatar
        shape="square"
        src={LncrawlImage}
        size={24}
        style={{ paddingBottom: 3 }}
      />
      <Typography.Text strong style={{ fontSize: 16 }}>
        Lightnovel Crawler
      </Typography.Text>
    </Flex>
  );
};
