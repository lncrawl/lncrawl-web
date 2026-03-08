import { ErrorState } from '@/components/Loading/ErrorState';
import { LoadingState } from '@/components/Loading/LoadingState';
import { TeamOutlined } from '@ant-design/icons';
import {
  Divider,
  Flex,
  Input,
  List,
  Pagination,
  Select,
  Typography,
} from 'antd';
import { ReferrerCard } from '../UserDetails/ReferrerCard';
import { useUserList } from './hooks';
import { UserListItemCard } from './UserListItemCard';

export const UserListPage: React.FC<any> = () => {
  const {
    search: initialSearch,
    perPage,
    currentPage,
    error,
    loading,
    total,
    users,
    referrerId,
    isVerified,
    isActive,
    refresh,
    updateParams,
  } = useUserList();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Failed to load novel list"
        onRetry={refresh}
      />
    );
  }

  return (
    <>
      <Typography.Title level={2}>
        <TeamOutlined /> Users
      </Typography.Title>

      <ReferrerCard referrerId={referrerId} />

      <Divider size="small" />

      <Flex align="center" wrap="wrap" gap="small">
        <Input.Search
          defaultValue={initialSearch}
          onSearch={(search) => updateParams({ search, page: 1 })}
          placeholder="Find users"
          allowClear
          size="large"
          style={{ minWidth: 250, flex: 3 }}
        />

        <Flex gap="small" style={{ minWidth: 250, flex: 1 }}>
          <Select
            allowClear
            size="large"
            placeholder="Verified"
            value={isVerified}
            onChange={(v) =>
              updateParams({
                verified: typeof v === 'boolean' ? v : null,
                page: 1,
              })
            }
            options={[
              { value: true, label: 'Verified' },
              { value: false, label: 'Unverified' },
            ]}
            style={{ flex: 1, minWidth: 150 }}
          />
          <Select
            allowClear
            size="large"
            placeholder="Status"
            value={isActive}
            onChange={(v) =>
              updateParams({
                active: typeof v === 'boolean' ? v : null,
                page: 1,
              })
            }
            options={[
              { value: true, label: 'Active' },
              { value: false, label: 'Inactive' },
            ]}
            style={{ flex: 1, minWidth: 100 }}
          />
        </Flex>
      </Flex>

      <Divider size="small" />

      <Typography.Text
        italic
        type="secondary"
        style={{ display: 'block', marginBottom: 5 }}
      >
        Found {total} users
      </Typography.Text>

      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={(user) => (
          <UserListItemCard user={user} onChange={refresh} />
        )}
      />

      <Pagination
        current={currentPage}
        total={total}
        pageSize={perPage}
        showSizeChanger={false}
        onChange={(page) => updateParams({ page })}
        style={{ textAlign: 'center', marginTop: 32 }}
        hideOnSinglePage
      />
    </>
  );
};

export default UserListPage;
