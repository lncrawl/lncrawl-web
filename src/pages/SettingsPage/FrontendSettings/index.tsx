import type { RootState } from '@/store';
import { Config, CONFIG_LIMITS } from '@/store/_config';
import {
  BookOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Button,
  Collapse,
  Flex,
  Grid,
  message,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import appStyles from '../ApplicationSettings/ApplicationSettings.module.scss';
import {
  type FrontendConfigItem,
  FrontendConfigRow,
} from './FrontendConfigRow';

const LIST_PAGE_ROWS: FrontendConfigItem[] = [
  {
    key: 'requests',
    label: 'Requests',
    description:
      'How many rows you see at once on the main Requests list, and on similar lists that open from there.',
    ...CONFIG_LIMITS.jobListPageSize,
    get: (s) => s.jobListPageSize,
    set: Config.action.setJobListPageSize,
  },
  {
    key: 'users',
    label: 'Users',
    description:
      'How many users appear on each page on the Users screen (admin).',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.userListPageSize,
    set: Config.action.setUserListPageSize,
    access: (isLocal, isAdmin) => !isLocal && isAdmin,
  },
  {
    key: 'feedback',
    label: 'Feedback list',
    description:
      'How many items you see on one page in the Feedback inbox.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.feedbackListPageSize,
    set: Config.action.setFeedbackListPageSize,
  },
  {
    key: 'libraries',
    label: 'Libraries',
    description:
      'How many libraries load on each page when you browse yours, public libraries, or everything together.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.libraryListPageSize,
    set: Config.action.setLibraryListPageSize,
  },
  {
    key: 'library-novels',
    label: 'Library novels',
    description:
      'When you open one library, how many novels appear on each page.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.libraryNovelListPageSize,
    set: Config.action.setLibraryNovelListPageSize,
  },
  {
    key: 'volume-chapters',
    label: 'Volume chapters',
    description:
      'For each volume, how many chapters show on one page in the chapter list. If you change this on that screen, we keep it here too.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.volumeChapterListPageSize,
    set: Config.action.setVolumeChapterListPageSize,
  },
  {
    key: 'sources',
    label: 'Supported sources',
    description:
      'How many sources appear on each page when you choose or browse supported sources.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.supportSourcesPageSize,
    set: Config.action.setSupportedSourcesPageSize,
  },
];

const NOVEL_LIST_PAGE_ROWS: FrontendConfigItem[] = [
  {
    key: 'novel-wide',
    label: 'Very wide window',
    description:
      'When the window is very wide and several covers sit in one row, how many novels load before you scroll.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.novelListPageSizeXl,
    set: Config.action.setNovelListPageSizeXl,
  },
  {
    key: 'novel-medium',
    label: 'Typical desktop window',
    description:
      'For an ordinary desktop browser width—fewer covers across the row than the very wide case.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.novelListPageSizeLg,
    set: Config.action.setNovelListPageSizeLg,
  },
  {
    key: 'novel-narrow',
    label: 'Narrow window',
    description:
      'For smaller layouts, like a tablet or a slim window where only one or two covers fit per row.',
    ...CONFIG_LIMITS.pageSize,
    get: (s) => s.novelListPageSizeSm,
    set: Config.action.setNovelListPageSizeSm,
  },
];

const POLLING_ROWS: FrontendConfigItem[] = [
  {
    key: 'request-list-refresh',
    label: 'Request list auto-refresh',
    description:
      'How often the Requests list checks for updates while you are on the first page, or while incomplete Requests are still visible.',
    step: 500,
    suffix: 'ms',
    ...CONFIG_LIMITS.listPollIntervalMs,
    get: (s) => s.jobListRefreshIntervalMs,
    set: Config.action.setJobListRefreshIntervalMs,
  },
  {
    key: 'chapter-poll',
    label: 'While a chapter is loading',
    description:
      'In the reader, how often we check whether the chapter text is ready yet.',
    step: 250,
    suffix: 'ms',
    ...CONFIG_LIMITS.shortPollIntervalMs,
    get: (s) => s.chapterFetchPollIntervalMs,
    set: Config.action.setChapterFetchPollIntervalMs,
  },
  {
    key: 'request-details-poll',
    label: 'Request details page',
    description:
      'On a Request details page, how often the screen checks for progress while the Request is still in progress.',
    step: 250,
    suffix: 'ms',
    ...CONFIG_LIMITS.shortPollIntervalMs,
    get: (s) => s.jobDetailsPollIntervalMs,
    set: Config.action.setJobDetailsPollIntervalMs,
  },
  {
    key: 'runner-status',
    label: 'Admin runner status',
    description:
      'For admins: how often Settings checks runner status (Admin actions).',
    step: 500,
    suffix: 'ms',
    ...CONFIG_LIMITS.listPollIntervalMs,
    get: (s) => s.adminRunnerStatusPollIntervalMs,
    set: Config.action.setAdminRunnerStatusPollIntervalMs,
    access: (_, isAdmin) => isAdmin,
  },
];

const TIMING_ROWS: FrontendConfigItem[] = [
  {
    key: 'fetch-delay',
    label: 'Brief pause before loading lists',
    description:
      'After the address or filters change, wait this long before loading the list again. Slightly smoother if you click around quickly.',
    step: 10,
    suffix: 'ms',
    ...CONFIG_LIMITS.fetchStaggerMs,
    get: (s) => s.listFetchDelayMs,
    set: Config.action.setListFetchDelayMs,
  },
  {
    key: 'debounce',
    label: 'Search and filters',
    description:
      'After you stop typing, wait this long before the list catches up and the address bar reflects your search or filters.',
    step: 25,
    suffix: 'ms',
    ...CONFIG_LIMITS.listFilterDebounceMs,
    get: (s) => s.listFilterDebounceMs,
    set: Config.action.setListFilterDebounceMs,
  },
];

export const FrontendSettings: React.FC = () => {
  const dispatch = useDispatch();
  const screens = Grid.useBreakpoint();
  const state = useSelector((s: RootState) => s.config);
  const [activeKey, setActiveKey] = useState<string>('lists');
  const [messageApi, contextHolder] = message.useMessage();

  const items = useMemo(
    () => [
      {
        key: 'lists',
        label: (
          <Space>
            <UnorderedListOutlined />
            <Typography.Text strong type="success">
              List page sizes
            </Typography.Text>
          </Space>
        ),
        children: (
          <FrontendConfigRow
            rows={LIST_PAGE_ROWS}
            state={state}
            screens={screens}
          />
        ),
      },
      {
        key: 'novel-list',
        label: (
          <Space>
            <BookOutlined />
            <Typography.Text strong type="success">
              Novel list page sizes
            </Typography.Text>
          </Space>
        ),
        children: (
          <FrontendConfigRow
            rows={NOVEL_LIST_PAGE_ROWS}
            state={state}
            screens={screens}
          />
        ),
      },
      {
        key: 'polling',
        label: (
          <Space>
            <ClockCircleOutlined />
            <Typography.Text strong type="success">
              Auto-refresh & polling
            </Typography.Text>
          </Space>
        ),
        children: (
          <FrontendConfigRow
            rows={POLLING_ROWS}
            state={state}
            screens={screens}
          />
        ),
      },
      {
        key: 'timing',
        label: (
          <Space>
            <SearchOutlined />
            <Typography.Text strong type="success">
              Search & list timing
            </Typography.Text>
          </Space>
        ),
        children: (
          <FrontendConfigRow
            rows={TIMING_ROWS}
            state={state}
            screens={screens}
          />
        ),
      },
    ],
    [state, screens]
  );

  return (
    <Flex vertical gap={16}>
      {contextHolder}
      <Collapse
        accordion
        bordered={false}
        expandIconPlacement="end"
        className={appStyles.sectionAccordion}
        activeKey={activeKey}
        onChange={(key) =>
          setActiveKey(
            Array.isArray(key) ? (key[0] ?? 'lists') : (key ?? 'lists')
          )
        }
        items={items}
      />

      <Flex align="flex-start" justify="space-between" gap={12} wrap="wrap">
        <Typography.Text type="secondary" style={{ fontSize: 12, flex: 1 }}>
          Changes save on their own in this browser and take effect right away.
        </Typography.Text>
        <Popconfirm
          title="Reset everything here to defaults?"
          description={
            <>
              Every option below goes back to its original value. You can always
              adjust them again afterward.
            </>
          }
          okText="Reset"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
          onConfirm={() => {
            dispatch(Config.action.resetToDefaults());
            messageApi.success('Restored default preferences');
          }}
          styles={{ container: { maxWidth: 300 } }}
        >
          <Button danger style={{ flexShrink: 0 }}>
            Reset to defaults
          </Button>
        </Popconfirm>
      </Flex>
    </Flex>
  );
};
