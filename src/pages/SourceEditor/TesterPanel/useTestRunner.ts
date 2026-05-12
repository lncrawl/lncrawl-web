import { API_BASE_URL } from '@/config';
import { TEST_PASSED_MARKER } from '@/pages/SourceEditor/LogViewer/helper';
import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { TestStatus } from '@/types';
import { stringifyError } from '@/utils/errors';
import { Form } from 'antd';
import { KeyCode, KeyMod } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { TidyURL } from 'tidy-url';
import { useCurrentEditor } from '../EditorPanel/EditorRef';

interface FormValues {
  url: string;
}

export const useTestRunner = () => {
  const editor = useCurrentEditor();
  const abortRef = useRef(new AbortController());
  const source = useSelector(Editor.select.currentSource);
  const content = useSelector(Editor.select.currentDraft);

  const [form] = Form.useForm<FormValues>();
  const [logs, setLogs] = useState<string[]>([]);
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
        setLogs((prev) => [...prev, ...lines]);
        if (chunk.includes(TEST_PASSED_MARKER)) {
          passed = true;
        }
      }

      setStatus(passed ? TestStatus.passed : TestStatus.failed);
    } catch (err) {
      setLogs((prev) => [...prev, `<!> ${stringifyError(err)}`]);
      setStatus(TestStatus.failed);
    }
  }, [source?.domain, form, content, abortTest]);

  useEffect(() => {
    if (!editor) return;
    editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyR, runTest);
  }, [editor, runTest]);

  return {
    form,
    logs,
    status,
    runTest,
    abortTest,
  };
};

export type TestRunnerState = ReturnType<typeof useTestRunner>;
