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
        width: '100%',
        height: '100%',
        padding: '32px 24px',
        ...flexProps.style,
      }}
    >
      <Spin size="large"></Spin>
      {message && <Typography.Text type="secondary">{message}</Typography.Text>}
    </Flex>
  );
};
