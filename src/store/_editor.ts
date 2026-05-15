import type { SourceItem } from '@/types';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import type { PersistConfig } from 'redux-persist';
import type { RootState } from '.';

const MAX_URL_HISTORY_PER_DOMAIN = 50;
const MAX_CODE_HISTORY_PER_DOMAIN = 2;

export interface DomainHistory {
  url: string;
  time: number;
}

export interface CodeDraft {
  version: number;
  stack: string[];
}

interface EditorState {
  code: string | null;
  source: SourceItem | null;
  codeHistory: Record<string, CodeDraft | undefined>;
  urlHistory: Record<string, DomainHistory[] | undefined>;
  lspStatus: LspStatus;
  lspLogs: LspLogEntry[];
  lspRetryKey: number;
}

const initialState: EditorState = {
  code: null,
  source: null,
  codeHistory: {},
  urlHistory: {},
  lspLogs: [],
  lspStatus: 'offline',
  lspRetryKey: 0,
};

export const EditorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCurrent(
      state,
      action: PayloadAction<{ code: string; source: SourceItem } | null>
    ) {
      if (!action.payload) {
        state.code = null;
        state.source = null;
      } else {
        state.code = action.payload.code;
        state.source = action.payload.source;
        const history = state.codeHistory[state.source.domain];
        if (history && history.version !== state.source.version) {
          delete state.codeHistory[state.source.domain];
        }
      }
    },
    pushCodeChange(state, action: PayloadAction<string>) {
      if (!state.source) return;
      const history = state.codeHistory[state.source.domain];
      const stack = (history?.stack || [])
        .filter((x) => x !== action.payload)
        .slice(-MAX_CODE_HISTORY_PER_DOMAIN + 1);
      state.codeHistory[state.source.domain] = {
        version: state.source.version,
        stack: [...stack, action.payload],
      };
    },
    popLastCodeChange(state) {
      if (!state.source) return;
      state.codeHistory[state.source.domain]?.stack.pop();
    },
    clearCodeHistory(state) {
      if (!state.source) return;
      delete state.codeHistory[state.source.domain];
    },
    addNovelUrl(state, action: PayloadAction<string>) {
      const url = action.payload;
      const domain = new URL(url).host.replace(/^www./, '');
      const item: DomainHistory = { url, time: Date.now() };
      const history = (state.urlHistory[domain] || [])
        .filter((x) => x.url !== url)
        .slice(0, MAX_URL_HISTORY_PER_DOMAIN - 1);
      state.urlHistory[domain] = [item, ...history];
    },
    setLspStatus(state, action: PayloadAction<LspStatus>) {
      state.lspStatus = action.payload;
    },
    retryLsp(state) {
      state.lspRetryKey += 1;
      state.lspStatus = 'connecting';
      state.lspLogs = [
        ...state.lspLogs.slice(-99),
        { time: Date.now(), level: 'info', message: 'Retrying connection...' },
      ];
    },
    addLspLog(state, action: PayloadAction<Omit<LspLogEntry, 'time'>>) {
      const { level, message } = action.payload;
      state.lspLogs = [
        ...state.lspLogs.slice(-99),
        { time: Date.now(), level, message },
      ];
    },
  },
});

const selectEditor = (state: RootState) => state.editor;

const selectSource = createSelector(selectEditor, (editor) => editor.source);
const selectCode = createSelector(selectEditor, (editor) => editor.code);
const selectDomain = createSelector(selectSource, (source) => source?.domain);
const selectCodeHistory = createSelector(
  selectDomain,
  selectEditor,
  (domain, editor) => (domain && editor.codeHistory[domain]?.stack) || []
);
const selectLatestDraft = createSelector(
  selectCode,
  selectCodeHistory,
  (code, history) => history[0] || code
);
const selectPreviousDraft = createSelector(
  selectCodeHistory,
  (history) => history[1]
);
const selectHasCodeChanges = createSelector(
  selectCodeHistory,
  (history) => history.length > 0
);

const selectUrlHistory = createSelector(
  selectEditor,
  selectDomain,
  (editor, domain) => (domain && editor.urlHistory[domain]) || []
);
const selectLastUrlHistory = createSelector(
  selectUrlHistory,
  (history) => history[0]
);

const selectLspStatus = createSelector(
  selectEditor,
  (editor) => editor.lspStatus
);
const selectLspLogs = createSelector(selectEditor, (editor) => editor.lspLogs);
const selectLspRetryKey = createSelector(
  selectEditor,
  (editor) => editor.lspRetryKey
);

export const Editor = {
  action: EditorSlice.actions,
  select: {
    urlHistory: selectUrlHistory,
    lastTestUrl: selectLastUrlHistory,
    currentSource: selectSource,
    currentCode: selectCode,
    currentDraft: selectLatestDraft,
    previousDraft: selectPreviousDraft,
    codeHistory: selectCodeHistory,
    hasChanges: selectHasCodeChanges,
    lspStatus: selectLspStatus,
    lspLogs: selectLspLogs,
    lspRetryKey: selectLspRetryKey,
  },
};

//
// Persist state
//
const blacklist: Array<keyof EditorState> = [
  // items to exclude from local storage
  'code',
  'source',
  'lspLogs',
  'lspStatus',
  'lspRetryKey',
];

const store = idb.createStore('lncrawl', 'editor');

export const editorPersistConfig: PersistConfig<EditorState> = {
  key: 'editor',
  version: 2,
  blacklist,
  storage: {
    getItem: (key) => idb.get(key, store),
    removeItem: (key) => idb.del(key, store),
    setItem: (key, value) => idb.set(key, value, store),
  },
};
