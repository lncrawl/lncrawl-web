import { Flex, Spin, Typography, type FlexProps } from 'antd';

export const LoadingState: React.FC<
  FlexProps & {
    message?: string;
  }
> = ({ message, ...flexProps }) => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      {...flexProps}
      style={{
        flex: 1,
        padding: '32px 24px',
        ...flexProps.style,
      }}
    >
      <Spin size="large"></Spin>
      {message && <Typography.Text type="secondary">{message}</Typography.Text>}
    </Flex>
  );
};
