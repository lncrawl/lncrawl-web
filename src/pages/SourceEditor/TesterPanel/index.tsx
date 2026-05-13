import { LogViewer } from '@/pages/SourceEditor/LogViewer';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { TestStatus } from '@/types';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Tooltip } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { NovelUrlForm } from './NovelUrlForm';
import { SubmitPRButton } from './SubmitPRButton';
import { TestStatusMessage } from './TestStatusMessage';
import { useTestRunner } from './useTestRunner';

export const TesterPanel: React.FC<any> = () => {
  const isAdmin = useSelector(Auth.select.isAdmin);
  const canUndo = useSelector(Editor.select.canUndo);
  const source = useSelector(Editor.select.currentSource);

  const canRunTest = isAdmin || !canUndo;
  const { form, status, logs, runTest, abortTest } = useTestRunner();

  return (
    <>
      {source && <NovelUrlForm form={form} source={source} />}

      <Flex gap={10} align="center" style={{ marginBottom: 12 }}>
        {status === TestStatus.running ? (
          <Button type="primary" onClick={abortTest} icon={<StopOutlined />}>
            Stop Test
          </Button>
        ) : (
          <Tooltip
            title={
              canRunTest
                ? undefined
                : 'Running test is not allowed with modified code yet'
            }
          >
            <Button
              type="primary"
              onClick={runTest}
              disabled={!canRunTest}
              icon={<PlayCircleOutlined />}
            >
              Run Test
            </Button>
          </Tooltip>
        )}
        <TestStatusMessage status={status} />
      </Flex>

      <LogViewer status={status} logs={logs} />

      {isAdmin && (
        <>
          <Divider size="small" />
          <SubmitPRButton status={status} logs={logs} />
        </>
      )}
    </>
  );
};
