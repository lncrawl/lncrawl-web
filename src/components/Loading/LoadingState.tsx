import { Flex, Spin, Typography } from 'antd';

export const LoadingState: React.FC<{
  message?: string;
}> = ({ message }) => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      style={{
        height: '100%',
        padding: '32px 24px',
      }}
    >
      <Spin size="large"></Spin>
      {message && <Typography.Text type="secondary">{message}</Typography.Text>}
    </Flex>
  );
};
