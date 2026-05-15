import { Editor } from '@/store/_editor';
import type { SourceItem } from '@/types';
import { Flex, Form, Input, Typography } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { NovelUrlHistory } from './NovelUrlHistory';
import { type TestRunnerState } from './useTestRunner';

export const NovelUrlForm: React.FC<{
  source: SourceItem;
  form: TestRunnerState['form'];
}> = ({ form, source }) => {
  const url = useSelector(Editor.select.lastTestUrl) || '';
  return (
    <Form form={form} layout="vertical" initialValues={{ url }}>
      <Flex gap={10} align="center" justify="space-between">
        <div>
          <Typography.Text type="success">*</Typography.Text> Novel URL
        </div>
        <NovelUrlHistory onSelect={(url) => form.setFieldValue('url', url)} />
      </Flex>

      <Form.Item
        name="url"
        style={{ marginBottom: 8, marginTop: 4 }}
        rules={[{ required: true, message: 'Enter Novel URL to run test' }]}
      >
        <Input.TextArea
          rows={3}
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
