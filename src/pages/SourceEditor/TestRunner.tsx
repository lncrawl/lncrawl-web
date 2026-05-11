import { LogViewer } from '@/components/LogViewer';
import { store } from '@/store';
import { Editor, type DomainHistory } from '@/store/_editor';
import type { SourceItem } from '@/types';
import { TestStatus } from '@/types';
import { formatFromNow } from '@/utils/time';
import {
  CheckCircleOutlined,
  ClearOutlined,
  CloseCircleOutlined,
  DownOutlined,
  HistoryOutlined,
  PlayCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Flex,
  Form,
  Input,
  Space,
  theme,
  Typography,
  type MenuProps,
} from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import type { TestRunnerState } from './useTestRunner';

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

const RunTestButton: React.FC<{
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

const NovelUrlHistory: React.FC<{
  history: DomainHistory[];
  onClear: () => any;
  onSelect: (url: string) => any;
}> = ({ history, onSelect, onClear }) => {
  const { token } = theme.useToken();

  if (!history?.length) {
    return null;
  }

  const items: MenuProps['items'] = [
    ...(history.length > 0
      ? [
          {
            key: 'action:clear',
            label: 'Clear History',
            icon: <ClearOutlined />,
            onClick: () => onClear(),
          },
          { type: 'divider' as const },
        ]
      : []),
    ...history.map(({ url, time }, i) => ({
      key: url + i,
      onClick: () => onSelect(url),
      label: (
        <>
          {url}
          <Typography.Text
            type="secondary"
            style={{ fontSize: 11, textAlign: 'right', paddingLeft: 5 }}
          >
            &middot; {formatFromNow(time)}
          </Typography.Text>
        </>
      ),
    })),
  ];

  return (
    <Dropdown
      trigger={['click']}
      autoAdjustOverflow
      styles={{
        item: { width: 350, maxWidth: '90vh' },
        root: { height: 300, overflow: 'auto' },
      }}
      menu={{
        items,
        style: { height: 'max-content', overflow: 'hidden' },
      }}
    >
      <Button
        type="text"
        size="small"
        icon={<HistoryOutlined />}
        style={{ color: token.colorTextSecondary }}
      >
        History <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const NovelUrlInputArea: React.FC<{
  source: SourceItem;
  form: TestRunnerState['form'];
}> = ({ form, source }) => {
  const history = useSelector(Editor.select.getHistory(source.domain));

  const handleClearHistory = () => {
    store.dispatch(Editor.action.clearUrlHistory({ domain: source.domain }));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ url: history[0]?.url || '' }}
    >
      <Flex gap={10} align="center" justify="space-between">
        <div>
          <Typography.Text type="success">*</Typography.Text> Novel URL
        </div>
        <NovelUrlHistory
          history={history}
          onClear={handleClearHistory}
          onSelect={(url) => form.setFieldValue('url', url)}
        />
      </Flex>

      <Form.Item
        name="url"
        style={{ marginBottom: 8, marginTop: 4 }}
        rules={[{ required: true, message: 'Enter Novel URL to run test' }]}
      >
        <Input.TextArea
          rows={1}
          autoSize
          size="large"
          autoComplete="novel-page-url"
          placeholder={`${source.url}/novel/example`}
          style={{
            resize: 'none',
            outline: 'none',
            fontFamily: "'IBM Plex Serif', Georgia, serif",
          }}
          styles={{
            textarea: {
              overflowX: 'hidden',
              overflowY: 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            },
          }}
        />
      </Form.Item>
    </Form>
  );
};

export const TestRunner: React.FC<{
  source: SourceItem;
  runner: TestRunnerState;
}> = ({
  source,
  runner: { form, status, logs, loading, runTest, abortTest },
}) => {
  return (
    <>
      <NovelUrlInputArea source={source} form={form} />

      <RunTestButton
        disabled={loading}
        status={status}
        onClick={() => runTest()}
        onAbort={() => abortTest()}
      />

      <LogViewer status={status} logs={logs} />
    </>
  );
};
