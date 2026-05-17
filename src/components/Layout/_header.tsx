import LncrawlImage from '@/assets/lncrawl.svg';
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
        height: 32,
        cursor: 'pointer',
        userSelect: 'none',
        padding: '0 10px',
        background: '#141414',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Avatar
        size={24}
        shape="square"
        src={LncrawlImage}
        style={{ paddingBottom: 3 }}
      />
      <Typography.Text
        style={{
          fontSize: 16,
          fontWeight: 500,
          fontFamily: 'Pacifico, cursive',
        }}
      >
        Lightnovel Crawler
      </Typography.Text>
    </Flex>
  );
};
