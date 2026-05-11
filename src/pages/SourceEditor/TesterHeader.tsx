import { Favicon } from '@/components/Favicon';
import { store } from '@/store';
import { Editor } from '@/store/_editor';
import type { SourceItem } from '@/types';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import { Button, Divider, Flex } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

export const TesterHeader: React.FC<{
  source: SourceItem;
}> = ({ source }) => {
  const isEditorCollapsed = useSelector(Editor.select.editorPanelCollapsed);
  return (
    <>
      <Flex
        gap={8}
        align="center"
        justify="center"
        style={{
          height: 49,
          fontSize: 16,
          padding: '0 20px',
          background: '#1a1a1a',
          overflow: 'hidden',
          position: 'relative',
          paddingLeft: 50,
        }}
      >
        <Button
          type="text"
          onClick={() => {
            store.dispatch(Editor.action.toggleEditorPanel());
          }}
          icon={
            isEditorCollapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />
          }
          style={{
            fontSize: 12,
            background: '#1d1f1f',
            borderRadius: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            width: 50,
            height: '100%',
          }}
        />

        <Button
          type="link"
          size="middle"
          href={source.url}
          rel="nofollow noopener noreferrer"
          target="_blank"
          style={{ fontSize: 'inherit' }}
        >
          <Favicon url={source.url} />
          {source.domain}
        </Button>
      </Flex>
      <Divider size="small" style={{ margin: 0 }} />
    </>
  );
};
