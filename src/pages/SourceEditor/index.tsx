import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { Splitter } from 'antd';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { TestRunner } from '../../components/TestRunner';
import { useTestRunner } from '../../components/TestRunner/hook';
import { EditorHeader } from './EditorHeader';
import { EditorPane } from './EditorPane';
import { TesterHeader } from './TesterHeader';
import { useSourceCode } from './useSourceCode';

export const SourceEditorPage: React.FC<any> = () => {
  const { domain } = useParams<{ domain: string }>();
  const { loading, error, source, code, refresh } = useSourceCode(domain);
  const testRunner = useTestRunner(source, code);

  const sizes = useSelector(Editor.select.panelSizes);
  const panelConfig = useSelector(Editor.select.panelConfig);

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
        size={sizes[1]}
        min={panelConfig.panel2.min}
        style={{ overflow: 'hidden' }}
      >
        <TesterHeader source={source} />
        <div
          style={{
            height: 'calc(100% - 50px)',
            padding: '15px 10px',
          }}
        >
          <TestRunner source={source} runner={testRunner} />
        </div>
      </Splitter.Panel>
    </Splitter>
  );
};
