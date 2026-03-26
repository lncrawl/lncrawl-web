import LncrawlImage from '@/assets/lncrawl.svg';
import { Avatar, Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

export const MobileLayoutHeader: React.FC<any> = () => {
  const navigate = useNavigate();
  return (
    <Typography.Title
      onClick={() => navigate('/')}
      level={4}
      style={{
        textAlign: 'center',
        fontSize: 18,
        margin: 7,
      }}
    >
      <Avatar
        shape="square"
        src={LncrawlImage}
        size={24}
        style={{ paddingBottom: 3 }}
      />
      Lightnovel Crawler
    </Typography.Title>
  );
};

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
