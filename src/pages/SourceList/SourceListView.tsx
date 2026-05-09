import { store } from '@/store';
import { Config } from '@/store/_config';
import type { SourceItem } from '@/types';
import { List } from 'antd';
import { useSelector } from 'react-redux';
import { SourceListCard } from './SourceListCard';

export const SourceListView: React.FC<{
  sources: SourceItem[];
  disabled?: boolean;
}> = ({ sources, disabled }) => {
  const defaultPageSize = useSelector(Config.select.SourceListPageSize);
  const updatePageSize = (pageSize: number) => {
    store.dispatch(Config.action.setSourceListPageSize(pageSize));
  };
  return (
    <>
      <List
        size="small"
        dataSource={sources}
        grid={{ gutter: 5, column: 1 }}
        renderItem={(source) => (
          <List.Item style={{ margin: 0, marginTop: 5, padding: 0 }}>
            <SourceListCard source={source} disabled={disabled} />
          </List.Item>
        )}
        pagination={{
          defaultPageSize,
          hideOnSinglePage: true,
          showSizeChanger: true,
          pageSizeOptions: [8, 12, 16, 25, 50, 100],
          onChange: (_, pageSize) => updatePageSize(pageSize),
        }}
      />
    </>
  );
};
