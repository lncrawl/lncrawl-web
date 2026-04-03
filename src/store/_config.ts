import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PersistConfig } from 'redux-persist';
import { createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import type { RootState } from '.';

export const CONFIG_LIMITS = {
  pageSize: { min: 5, max: 100 },
  jobListPageSize: { min: 5, max: 50 },
  listPollIntervalMs: { min: 500, max: 120_000 },
  fetchStaggerMs: { min: 0, max: 500 },
  listFilterDebounceMs: { min: 50, max: 800 },
} as const;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

//
// Initial State
//

export interface ConfigState {
  supportSourcesPageSize: number;
  jobListPageSize: number;
  jobListRefreshIntervalMs: number;
  listFetchDelayMs: number;
  listFilterDebounceMs: number;
  readerPreloadNextChapter: boolean;
  readerPreloadPreviousChapter: boolean;
  chapterFetchPollIntervalMs: number;
  jobDetailsPollIntervalMs: number;
  adminRunnerStatusPollIntervalMs: number;
  userListPageSize: number;
  feedbackListPageSize: number;
  libraryListPageSize: number;
  libraryNovelListPageSize: number;
  volumeChapterListPageSize: number;
  novelListPageSizeXl: number;
  novelListPageSizeLg: number;
  novelListPageSizeSm: number;
}

const buildInitialState = (): ConfigState => ({
  supportSourcesPageSize: 12,
  jobListPageSize: 10,
  jobListRefreshIntervalMs: 5000,
  listFetchDelayMs: 50,
  listFilterDebounceMs: 300,
  readerPreloadNextChapter: true,
  readerPreloadPreviousChapter: false,
  chapterFetchPollIntervalMs: 1000,
  jobDetailsPollIntervalMs: 2500,
  adminRunnerStatusPollIntervalMs: 5000,
  userListPageSize: 10,
  feedbackListPageSize: 15,
  libraryListPageSize: 12,
  libraryNovelListPageSize: 12,
  volumeChapterListPageSize: 10,
  novelListPageSizeXl: 24,
  novelListPageSizeLg: 16,
  novelListPageSizeSm: 12,
});

//
// Slice
//
export const ConfigSlice = createSlice({
  name: 'config',
  initialState: buildInitialState(),
  reducers: {
    setSupportedSourcesPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.supportSourcesPageSize = clamp(action.payload, min, max);
    },
    setJobListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.jobListPageSize;
      state.jobListPageSize = clamp(action.payload, min, max);
    },
    setJobListRefreshIntervalMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.listPollIntervalMs;
      state.jobListRefreshIntervalMs = clamp(action.payload, min, max);
    },
    setListFetchDelayMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.fetchStaggerMs;
      state.listFetchDelayMs = clamp(action.payload, min, max);
    },
    setListFilterDebounceMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.listFilterDebounceMs;
      state.listFilterDebounceMs = clamp(action.payload, min, max);
    },
    setReaderPreloadPreviousChapter(state, action: PayloadAction<boolean>) {
      state.readerPreloadPreviousChapter = action.payload;
    },
    setReaderPreloadNextChapter(state, action: PayloadAction<boolean>) {
      state.readerPreloadNextChapter = action.payload;
    },
    setChapterFetchPollIntervalMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.listPollIntervalMs;
      state.chapterFetchPollIntervalMs = clamp(action.payload, min, max);
    },
    setJobDetailsPollIntervalMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.listPollIntervalMs;
      state.jobDetailsPollIntervalMs = clamp(action.payload, min, max);
    },
    setAdminRunnerStatusPollIntervalMs(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.listPollIntervalMs;
      state.adminRunnerStatusPollIntervalMs = clamp(action.payload, min, max);
    },
    setUserListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.userListPageSize = clamp(action.payload, min, max);
    },
    setFeedbackListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.feedbackListPageSize = clamp(action.payload, min, max);
    },
    setLibraryListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.libraryListPageSize = clamp(action.payload, min, max);
    },
    setLibraryNovelListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.libraryNovelListPageSize = clamp(action.payload, min, max);
    },
    setVolumeChapterListPageSize(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.volumeChapterListPageSize = clamp(action.payload, min, max);
    },
    setNovelListPageSizeXl(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.novelListPageSizeXl = clamp(action.payload, min, max);
    },
    setNovelListPageSizeLg(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.novelListPageSizeLg = clamp(action.payload, min, max);
    },
    setNovelListPageSizeSm(state, action: PayloadAction<number>) {
      const { min, max } = CONFIG_LIMITS.pageSize;
      state.novelListPageSizeSm = clamp(action.payload, min, max);
    },
    resetToDefaults() {
      return buildInitialState();
    },
  },
});

//
// Actions & Selectors
//
const selectConfigState = (state: RootState) => state.config;

const supportedSourcesPageSize = createSelector(
  selectConfigState,
  (s) => s.supportSourcesPageSize
);
const jobListPageSize = createSelector(
  selectConfigState,
  (s) => s.jobListPageSize
);
const jobListRefreshIntervalMs = createSelector(
  selectConfigState,
  (s) => s.jobListRefreshIntervalMs
);
const listFetchDelayMs = createSelector(
  selectConfigState,
  (s) => s.listFetchDelayMs
);
const listFilterDebounceMs = createSelector(
  selectConfigState,
  (s) => s.listFilterDebounceMs
);
const readerPreloadNextChapter = createSelector(
  selectConfigState,
  (s) => s.readerPreloadNextChapter
);
const readerPreloadPreviousChapter = createSelector(
  selectConfigState,
  (s) => s.readerPreloadPreviousChapter
);
const chapterFetchPollIntervalMs = createSelector(
  selectConfigState,
  (s) => s.chapterFetchPollIntervalMs
);
const jobDetailsPollIntervalMs = createSelector(
  selectConfigState,
  (s) => s.jobDetailsPollIntervalMs
);
const adminRunnerStatusPollIntervalMs = createSelector(
  selectConfigState,
  (s) => s.adminRunnerStatusPollIntervalMs
);
const userListPageSize = createSelector(
  selectConfigState,
  (s) => s.userListPageSize
);
const feedbackListPageSize = createSelector(
  selectConfigState,
  (s) => s.feedbackListPageSize
);
const libraryListPageSize = createSelector(
  selectConfigState,
  (s) => s.libraryListPageSize
);
const libraryNovelListPageSize = createSelector(
  selectConfigState,
  (s) => s.libraryNovelListPageSize
);
const volumeChapterListPageSize = createSelector(
  selectConfigState,
  (s) => s.volumeChapterListPageSize
);
const novelListPageSizeXl = createSelector(
  selectConfigState,
  (s) => s.novelListPageSizeXl
);
const novelListPageSizeLg = createSelector(
  selectConfigState,
  (s) => s.novelListPageSizeLg
);
const novelListPageSizeSm = createSelector(
  selectConfigState,
  (s) => s.novelListPageSizeSm
);

export const Config = {
  action: ConfigSlice.actions,
  select: {
    supportedSourcesPageSize,
    jobListPageSize,
    jobListRefreshIntervalMs,
    listFetchDelayMs,
    listFilterDebounceMs,
    readerPreloadNextChapter,
    readerPreloadPreviousChapter,
    chapterFetchPollIntervalMs,
    jobDetailsPollIntervalMs,
    adminRunnerStatusPollIntervalMs,
    userListPageSize,
    feedbackListPageSize,
    libraryListPageSize,
    libraryNovelListPageSize,
    volumeChapterListPageSize,
    novelListPageSizeXl,
    novelListPageSizeLg,
    novelListPageSizeSm,
  },
};

//
// Persist Config
//
const blacklist: Array<keyof ConfigState> = [];

const REMOVED_CONFIG_KEYS = [
  'httpRequestTimeoutMs',
  'readerChapterCacheMax',
  'jobDetailsApiCacheTtlMs',
  'sourceFilterDebounceMs',
] as const;

function mergePersistedConfig(state: unknown): ConfigState {
  const raw =
    state && typeof state === 'object'
      ? { ...(state as Record<string, unknown>) }
      : {};
  for (const k of REMOVED_CONFIG_KEYS) {
    delete raw[k];
  }
  return { ...buildInitialState(), ...(raw as Partial<ConfigState>) };
}

const configMigrations = {
  2: mergePersistedConfig,
  3: mergePersistedConfig,
  4: mergePersistedConfig,
};

export const configPersistConfig: PersistConfig<ConfigState> = {
  key: 'config',
  version: 5,
  storage,
  blacklist,
  migrate: createMigrate(configMigrations as any, { debug: false }),
};
