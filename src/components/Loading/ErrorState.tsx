import { Button, Flex, Result, type FlexProps } from 'antd';

export const ErrorState: React.FC<
  FlexProps & {
    title: string;
    error?: string;
    onRetry?: () => void;
  }
> = ({ title, error, onRetry, ...flexProps }) => {
  return (
    <Flex
      align="center"
      justify="center"
      {...flexProps}
      style={{
        flex: 1,
        padding: '32px 24px',
        ...flexProps.style,
      }}
    >
      <Result
        status="error"
        title={title}
        subTitle={error || 'An error occurred while loading the data.'}
        extra={
          onRetry ? (
            <Button key="retry" onClick={onRetry}>
              Retry
            </Button>
          ) : undefined
        }
      />
    </Flex>
  );
};
