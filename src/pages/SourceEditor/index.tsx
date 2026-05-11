import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { Flex, Splitter } from 'antd';
import { throttle } from 'lodash-es';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { EditorHeader } from './EditorHeader';
import { EditorPane } from './EditorPane';
import { TesterHeader } from './TesterHeader';
import { TestRunner } from './TestRunner';
import { useSourceCode } from './useSourceCode';
import { useTestRunner } from './useTestRunner';

const CONTAINER_CLASS = 'source-editor-container';

export const SourceEditorPage: React.FC<any> = () => {
  const { domain } = useParams<{ domain: string }>();
  const { loading, error, source, code, refresh } = useSourceCode(domain);
  const testRunner = useTestRunner(source, code);

  const sizes = useSelector(Editor.select.panelSizes);
  const panelConfig = useSelector(Editor.select.panelConfig);

  useEffect(() => {
    const onResize = throttle(() => {
      const state = store.getState();
      const [left, right] = Editor.select.panelSizes(state);
      if (left === 0 || right === 0) return;
      const { panel1, panel2 } = Editor.select.panelConfig(state);
      const container = document.querySelector(`.${CONTAINER_CLASS}`);
      const width = container?.clientWidth ?? window.innerWidth;
      const total = left && right ? left + right : width;
      if (panel1.min + panel2.min > total) {
        store.dispatch(Editor.action.setPanelSizes([undefined, 0]));
      }
    }, 100);
    const aborter = new AbortController();
    window.addEventListener('resize', onResize, {
      passive: true,
      signal: aborter.signal,
    });
    return () => {
      aborter.abort();
      onResize.cancel();
    };
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !source || !code) {
    return (
      <ErrorState
        error={error}
        title="Failed to load source"
        onRetry={refresh}
      />
    );
  }

  return (
    <Splitter
      rootClassName={CONTAINER_CLASS}
      style={{ height: '100vh', overflow: 'hidden' }}
      onResize={([panel1, panel2]) => {
        store.dispatch(Editor.action.setPanelSizes([panel1, panel2]));
      }}
    >
      <Splitter.Panel
        size={sizes[0]}
        min={panelConfig.panel1.min}
        style={{ overflow: 'hidden' }}
      >
        <EditorHeader source={source} />
        <div style={{ height: 'calc(100% - 50px)', position: 'relative' }}>
          <EditorPane code={code} onRunTest={() => testRunner.runTest()} />
        </div>
      </Splitter.Panel>

      <Splitter.Panel
        size={sizes[1] ?? panelConfig.panel2.default}
        min={panelConfig.panel2.min}
        style={{ overflow: 'hidden' }}
      >
        <TesterHeader source={source} />
        <Flex
          vertical
          style={{
            height: 'calc(100% - 50px)',
            padding: '15px 10px',
          }}
        >
          <TestRunner source={source} runner={testRunner} />
        </Flex>
      </Splitter.Panel>
    </Splitter>
  );
};
