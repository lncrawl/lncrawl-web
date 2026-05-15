import { store } from '@/store';
import { Auth } from '@/store/_auth';
import { Editor } from '@/store/_editor';
import { TestStatus, type SourcePRResponse } from '@/types';
import { stringifyError } from '@/utils/errors';
import { BranchesOutlined, PullRequestOutlined } from '@ant-design/icons';
import { Button, Flex, message, Tooltip, Typography } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { extractLines } from '../LogViewer/helper';

export const SubmitPRButton: React.FC<{
  logs: string[];
  status: TestStatus;
}> = ({ logs, status }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const hasChanges = useSelector(Editor.select.hasChanges);
  const disabled = !hasChanges || status !== TestStatus.passed;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pr, setPR] = useState<SourcePRResponse>();

  useEffect(() => {
    const fetch = async () => {
      try {
        const state = store.getState();
        const source = Editor.select.currentSource(state);
        if (!source) return;
        setLoading(true);
        const { data } = await axios.get<SourcePRResponse>(
          `/api/source/${source.domain}/pr`
        );
        setPR(data);
      } catch {
        //ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const state = store.getState();
      const user = Auth.select.user(state);
      const source = Editor.select.currentSource(state);
      const content = Editor.select.currentDraft(state);
      if (!source || !user) return;

      const testResult = extractLines(logs);
      const user_link = `${window.location.origin}/user/${user.id}`;

      const title = `Update source: ${source.domain}`;
      const body =
        `> Submitted by [${user.name}](${user_link})\n` +
        `> From: ${window.location.href}\n` +
        `> File: ${source.github_url}\n\n` +
        '```\n' +
        testResult +
        '\n```';

      const { data } = await axios.post<SourcePRResponse>(
        `/api/source/${source.domain}/pr`,
        {
          title,
          body,
          content,
        }
      );
      setPR(data);
      messageApi.success(`Pull Request #${data.number} submitted!`);
    } catch (err) {
      messageApi.error(stringifyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return;
  }

  return (
    <>
      {contextHolder}

      {pr && (
        <Flex wrap gap={5} style={{ marginBottom: 5 }}>
          Pull Request:
          <Typography.Link
            strong
            target="_blank"
            href={pr.url}
            rel="external alternate"
            style={{ flex: 1, minWidth: 50 }}
          >
            #{pr.number}
          </Typography.Link>
          <Typography.Text type="secondary">
            <BranchesOutlined /> {pr.branch}
          </Typography.Text>
        </Flex>
      )}

      <Tooltip
        title={
          !hasChanges
            ? 'No code changes to submit'
            : disabled
              ? 'Please ensure the tests are passing before submitting a Pull Request.'
              : undefined
        }
      >
        <Button
          block
          size="large"
          type="primary"
          disabled={disabled}
          loading={submitting}
          onClick={handleSubmit}
          icon={<PullRequestOutlined />}
          style={{ borderRadius: 0 }}
        >
          {pr ? 'Update' : 'Submit'} PR
        </Button>
      </Tooltip>
    </>
  );
};
