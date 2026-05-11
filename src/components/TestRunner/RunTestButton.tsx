import { TestStatus } from '@/types';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Button, Flex, Space, Typography } from 'antd';
import React from 'react';

const TestStatusMessage: React.FC<{ status: TestStatus }> = ({ status }) => {
  switch (status) {
    case TestStatus.passed:
      return (
        <Space size={6}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <Typography.Text type={'success'}>Passed</Typography.Text>
        </Space>
      );
    case TestStatus.failed:
      return (
        <Space size={6}>
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          <Typography.Text type={'danger'}>Failed</Typography.Text>
        </Space>
      );
    default:
      return null;
  }
};

export const RunTestButton: React.FC<{
  disabled: boolean;
  status: TestStatus;
  onClick: () => any;
  onAbort: () => any;
}> = ({ disabled, status, onClick, onAbort }) => {
  return (
    <Flex gap={10} align="center" style={{ marginBottom: 12 }}>
      {status === TestStatus.running ? (
        <Button
          type="primary"
          disabled={disabled}
          onClick={onAbort}
          icon={<StopOutlined />}
        >
          Stop Test
        </Button>
      ) : (
        <Button
          type="primary"
          disabled={disabled}
          onClick={onClick}
          icon={<PlayCircleOutlined />}
        >
          Run Test
        </Button>
      )}
      <TestStatusMessage status={status} />
    </Flex>
  );
};
