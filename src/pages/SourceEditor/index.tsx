import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { Flex, Splitter } from 'antd';
import { throttle } from 'lodash-es';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { EditorHeader } from './EditorPanel/EditorHeader';
import { EditorPane } from './EditorPanel/EditorPane';
import { useSourceCode } from './EditorPanel/useSourceCode';
import { TesterHeader } from './TesterPanel/TesterHeader';
import { TestRunner } from './TesterPanel/TestRunner';
import { useTestRunner } from './TesterPanel/useTestRunner';

const CONTAINER_CLASS = 'source-editor-container';

export const SourceEditorPage: React.FC<any> = () => {
  const { domain } = useParams<{ domain: string }>();
  const { loading, error, refresh } = useSourceCode(domain);
  const testRunner = useTestRunner();

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
    return <LoadingState style={{ width: '100%' }} />;
  }

  if (error) {
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
        <EditorHeader />
        <div style={{ height: 'calc(100% - 50px)', position: 'relative' }}>
          <EditorPane onRunTest={() => testRunner.runTest()} />
        </div>
      </Splitter.Panel>

      <Splitter.Panel
        size={sizes[1] ?? panelConfig.panel2.default}
        min={panelConfig.panel2.min}
        style={{ overflow: 'hidden' }}
      >
        <TesterHeader />
        <Flex
          vertical
          style={{
            height: 'calc(100% - 50px)',
            padding: '15px 10px',
          }}
        >
          <TestRunner runner={testRunner} />
        </Flex>
      </Splitter.Panel>
    </Splitter>
  );
};
