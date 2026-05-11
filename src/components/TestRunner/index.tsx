import { LogViewer } from '@/components/LogViewer';
import type { SourceItem } from '@/types';
import { Form, Input } from 'antd';
import React from 'react';
import { RunTestButton } from './RunTestButton';
import type { TestRunnerState } from './hook';

export const TestRunner: React.FC<{
  source: SourceItem;
  runner: TestRunnerState;
}> = ({
  source,
  runner: { form, status, logs, loading, runTest, abortTest },
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ url: '' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Form.Item
        name="url"
        label="Novel URL"
        style={{ marginBottom: 8 }}
        rules={[{ required: true, message: 'Enter Novel URL to run test' }]}
      >
        <Input size="large" placeholder={`${source.url}/novel/example`} />
      </Form.Item>

      <RunTestButton
        disabled={loading}
        status={status}
        onClick={() => runTest()}
        onAbort={() => abortTest()}
      />

      <LogViewer status={status} logs={logs} />
    </Form>
  );
};
