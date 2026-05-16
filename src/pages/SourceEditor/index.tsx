import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { Flex, Splitter } from 'antd';
import { useParams } from 'react-router-dom';
import { EditorHeader } from './EditorPanel/EditorHeader';
import { EditorPane } from './EditorPanel/EditorPane';
import { useSourceCode } from './EditorPanel/useSourceCode';
import { TesterPanel } from './TesterPanel';
import { TesterHeader } from './TesterPanel/TesterHeader';
import { usePanelSizes } from './usePanelSizes';

export const SourceEditorPage: React.FC<any> = () => {
  const pansiz = usePanelSizes();
  const { domain } = useParams<{ domain: string }>();
  const { loading, error, refresh } = useSourceCode(domain);

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
      style={{
        overflow: 'hidden',
        height: 'calc(100 * var(--visual-vh, 1dvh))',
      }}
      onResize={([panel1, panel2]) => {
        const percent = (100 * panel1) / (panel1 + panel2);
        pansiz.setEditorSize(`${Math.round(percent)}%`);
        pansiz.setTesterSize(panel2);
      }}
    >
      <Splitter.Panel
        size={pansiz.editorSize}
        style={{ overflow: 'hidden' }}
        collapsible={{
          showCollapsibleIcon: false,
          start: true,
          end: true,
        }}
      >
        <EditorHeader
          isTestPanelCollapsed={pansiz.isTesterCollapsed}
          onToggleTestPanelCollapse={pansiz.onToggleTestPanelCollapse}
        />
        <div style={{ height: 'calc(100% - 50px)', position: 'relative' }}>
          <EditorPane />
        </div>
      </Splitter.Panel>

      <Splitter.Panel
        size={pansiz.testerSize}
        style={{ overflow: 'hidden' }}
        collapsible={{
          showCollapsibleIcon: false,
          start: true,
          end: true,
        }}
      >
        <TesterHeader
          isEditorCollapsed={pansiz.isEditorCollapsed}
          onToggleEditorCollapse={pansiz.onToggleEditorCollapse}
        />
        <Flex
          vertical
          style={{
            height: 'calc(100% - 50px)',
            padding: '15px 10px',
          }}
        >
          <TesterPanel />
        </Flex>
      </Splitter.Panel>
    </Splitter>
  );
};
