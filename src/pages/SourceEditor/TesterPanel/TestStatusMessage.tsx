import { TestStatus } from '@/types';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import React from 'react';

export const TestStatusMessage: React.FC<{
  status: TestStatus;
}> = ({ status }) => {
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
