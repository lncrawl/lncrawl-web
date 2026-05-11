import { store } from '@/store';
import { Editor } from '@/store/_editor';
import type { SourceItem } from '@/types';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  GithubFilled,
  LeftOutlined,
} from '@ant-design/icons';
import { Button, Divider, Flex } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

export const EditorHeader: React.FC<{
  source: SourceItem;
}> = ({ source }) => {
  const isTestPanelCollapsed = useSelector(Editor.select.testPanelCollapsed);
  return (
    <>
      <Flex
        gap={8}
        align="center"
        style={{
          height: 49,
          fontSize: 16,
          padding: '0 20px',
          background: '#1a1a1a',
          overflow: 'hidden',
          position: 'relative',
          paddingRight: 50,
        }}
      >
        <Button
          shape="circle"
          type="text"
          icon={<LeftOutlined />}
          onClick={() => window.history.back()}
        />

        <Button
          type="link"
          size="middle"
          title="Edit file directly in Github"
          href={source.github_edit_url}
          rel="external alternate"
          target="_blank"
          style={{ fontSize: 'inherit' }}
        >
          <GithubFilled style={{ fontSize: 20 }} />/{source.file_path}
        </Button>

        <div style={{ flex: 1 }} />

        <Button
          type="text"
          onClick={() => {
            store.dispatch(Editor.action.toggleTestPanelCollapse());
          }}
          icon={
            isTestPanelCollapsed ? (
              <DoubleLeftOutlined />
            ) : (
              <DoubleRightOutlined />
            )
          }
          style={{
            fontSize: 12,
            background: '#1d1f1f',
            borderRadius: 0,
            position: 'absolute',
            top: 0,
            right: 0,
            width: 50,
            height: '100%',
          }}
        />
      </Flex>
      <Divider size="small" style={{ margin: 0 }} />
    </>
  );
};
