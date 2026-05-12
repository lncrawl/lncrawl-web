import { TEST_PASSED_MARKER } from '@/components/LogViewer/helper';
import { API_BASE_URL } from '@/config';
import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { type SourceItem, TestStatus } from '@/types';
import { stringifyError } from '@/utils/errors';
import { Form } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { TidyURL } from 'tidy-url';

const MAX_LOG_LINES = 5000;

interface FormValues {
  url: string;
}

export const useTestRunner = (source?: SourceItem, content?: string) => {
  const abortRef = useRef(new AbortController());

  const [form] = Form.useForm<FormValues>();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<TestStatus>(TestStatus.idle);

  const abortTest = useCallback(() => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
  }, []);

  const runTest = useCallback(async () => {
    abortTest();
    if (!source?.domain || !content) {
      return;
    }
    try {
      setLogs([]);
      setStatus(TestStatus.running);

      const fields = await form.validateFields(['url']);
      const trimmed = fields.url.replace(/[\n\r\t ]+/g, '');
      const { url } = TidyURL.clean(trimmed);

      form.setFieldValue('url', url);
      store.dispatch(Editor.action.addNovelUrl(url));

      setLoading(true);
      const authorization = Auth.select.authorization(store.getState());
      const res = await fetch(
        `${API_BASE_URL}/api/source/${source.domain}/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authorization ? { Authorization: authorization } : {}),
          },
          body: JSON.stringify({ url, content }),
          signal: abortRef.current.signal,
        }
      );
      setLoading(false);

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      let passed = false;
      const decoder = new TextDecoder();
      const reader = res.body.getReader();
      while (!abortRef.current.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim());
        setLogs((prev) => [...prev, ...lines].slice(-MAX_LOG_LINES));
        if (chunk.includes(TEST_PASSED_MARKER)) {
          passed = true;
        }
      }

      setStatus(passed ? TestStatus.passed : TestStatus.failed);
    } catch (err) {
      setLogs((prev) => [...prev, `<!> ${stringifyError(err)}`]);
      setStatus(TestStatus.failed);
      setLoading(false);
    }
  }, [source?.domain, form, content, abortTest]);

  return {
    form,
    logs,
    status,
    loading,
    runTest,
    abortTest,
  };
};

export type TestRunnerState = ReturnType<typeof useTestRunner>;
