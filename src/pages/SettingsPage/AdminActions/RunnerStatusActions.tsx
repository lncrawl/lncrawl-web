import { Config } from '@/store/_config';
import { Flex, Space, Spin, Tag, Typography } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { StartRunnerButton } from './StartRunnerButton';
import { StopRunnerButton } from './StopRunnerButton';

export const RunnerStatusActions: React.FC<any> = () => {
  const adminRunnerPollMs = useSelector(
    Config.select.adminRunnerStatusPollIntervalMs
  );
  const [isRunning, setIsRunning] = useState<boolean | undefined>();

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await axios.get<boolean>('/api/admin/runner/status');
      return Boolean(resp.data);
    } catch {
      return undefined;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    setIsRunning(await fetchStatus());
  }, [fetchStatus]);

  useEffect(() => {
    const tid = window.setTimeout(() => void refreshStatus(), 0);
    const iid = window.setInterval(
      () => void refreshStatus(),
      adminRunnerPollMs
    );
    return () => {
      clearTimeout(tid);
      clearInterval(iid);
    };
  }, [refreshStatus, adminRunnerPollMs]);

  return (
    <Flex vertical gap={12}>
      <Space wrap size="large">
        <Typography.Text>
          Scheduler status:{' '}
          {isRunning === undefined ? (
            <Spin size="small" />
          ) : isRunning ? (
            <Tag color="success">Running</Tag>
          ) : (
            <Tag>Stopped</Tag>
          )}
        </Typography.Text>

        {isRunning === false ? (
          <StartRunnerButton onComplete={refreshStatus} />
        ) : isRunning === true ? (
          <StopRunnerButton onComplete={refreshStatus} />
        ) : undefined}
      </Space>

      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        Manage the background scheduler responsible for processing the requests
        in the queue.
      </Typography.Text>
    </Flex>
  );
};
