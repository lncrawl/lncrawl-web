import { Editor } from '@/store/_editor';
import { formatFromNow } from '@/utils/time';
import { DownOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button, Dropdown, theme, Typography, type MenuProps } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';

export const NovelUrlHistory: React.FC<{
  onSelect: (url: string) => any;
}> = ({ onSelect }) => {
  const { token } = theme.useToken();
  const history = useSelector(Editor.select.urlHistory);

  if (!history?.length) {
    return null;
  }

  const items: MenuProps['items'] = history.map(({ url, time }, i) => ({
    key: url + i,
    onClick: () => onSelect(url),
    label: (
      <>
        {url}
        <Typography.Text
          type="secondary"
          style={{ fontSize: 11, textAlign: 'right', paddingLeft: 5 }}
        >
          &middot; {formatFromNow(time)}
        </Typography.Text>
      </>
    ),
  }));

  return (
    <Dropdown
      trigger={['click']}
      autoAdjustOverflow
      styles={{
        item: { width: 350, maxWidth: '90dvh' },
        root: { height: 300, overflow: 'auto' },
      }}
      menu={{
        items,
        style: { height: 'max-content', overflow: 'hidden' },
      }}
    >
      <Button
        type="text"
        size="small"
        icon={<HistoryOutlined />}
        style={{ color: token.colorTextSecondary }}
      >
        History <DownOutlined />
      </Button>
    </Dropdown>
  );
};
