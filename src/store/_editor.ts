import type { SourceItem } from '@/types';
import type { LspLogEntry, LspStatus } from '@/utils/lsp';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import type { PersistConfig } from 'redux-persist';
import type { RootState } from '.';

const MAX_URL_HISTORY_PER_DOMAIN = 50;

export interface DomainHistory {
  url: string;
  time: number;
}

export interface CodeDraft {
  code: string;
  version: number;
}

interface EditorState {
  code: string | null;
  draft: string | null;
  source: SourceItem | null;
  codeDrafts: Record<string, CodeDraft | undefined>;
  urlHistory: Record<string, DomainHistory[] | undefined>;
  lspStatus: LspStatus;
  lspLogs: LspLogEntry[];
}

const initialState: EditorState = {
  code: null,
  draft: null,
  source: null,
  codeDrafts: {},
  urlHistory: {},
  lspLogs: [],
  lspStatus: 'offline',
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
        state.draft = null;
        state.source = null;
      } else {
        if (state.source?.version !== action.payload.source.version) {
          state.draft = action.payload.code;
        }
        state.code = action.payload.code;
        state.source = action.payload.source;
      }
    },
    saveDraft(state, action: PayloadAction<string>) {
      // draft -> history ; payload -> draft
      if (state.source && state.draft !== action.payload) {
        if (state.draft !== null && state.draft !== state.code) {
          state.codeDrafts[state.source.domain] = {
            code: state.draft,
            version: state.source.version,
          };
        } else {
          delete state.codeDrafts[state.source.domain];
        }
        state.draft = action.payload;
      }
    },
    undo(state, action: PayloadAction<string | undefined>) {
      // draft -> history ; code -> draft
      if (state.source) {
        const latest = action.payload ?? state.draft;
        if (latest) {
          state.codeDrafts[state.source.domain] = {
            code: latest,
            version: state.source.version,
          };
        } else {
          delete state.codeDrafts[state.source.domain];
        }
        state.draft = state.code;
      }
    },
    redo(state) {
      // history -> draft
      if (state.source) {
        const history = state.codeDrafts[state.source.domain];
        if (history?.version === state.source.version) {
          state.draft = history.code;
        }
      }
    },
    clear(state) {
      // code -> draft ; delete history
      if (state.source) {
        state.draft = state.code;
        delete state.codeDrafts[state.source.domain];
      }
    },
    addNovelUrl(state, action: PayloadAction<string>) {
      const url = action.payload;
      const domain = extractDomain(url);
      const item: DomainHistory = { url, time: Date.now() };
      const history = (state.urlHistory[domain] || [])
        .filter((x) => x.url !== url)
        .slice(0, MAX_URL_HISTORY_PER_DOMAIN - 1);
      state.urlHistory[domain] = [item, ...history];
    },
    setLspStatus(state, action: PayloadAction<LspStatus>) {
      state.lspStatus = action.payload;
    },
    addLspLog(state, action: PayloadAction<Omit<LspLogEntry, 'time'>>) {
      const { level, message } = action.payload;
      state.lspLogs = [
        ...state.lspLogs.slice(-99),
        { time: new Date(), level, message },
      ];
    },
  },
});

const extractDomain = (url: string) => new URL(url).host.replace(/^www./, '');

const selectEditor = (state: RootState) => state.editor;

const selectUrlHistory = (url: string) =>
  createSelector(
    selectEditor,
    (editor) => editor.urlHistory[extractDomain(url)] || []
  );
const selectCurrentSource = createSelector(
  selectEditor,
  (editor) => editor.source
);
const selectCurrentContent = createSelector(
  selectEditor,
  (editor) => editor.code
);
const selectCurrentDraft = createSelector(
  selectEditor,
  (editor) => editor.draft
);
const selectCanUndo = createSelector(
  selectCurrentContent,
  selectCurrentDraft,
  (original, current) => (original || '') !== (current || '')
);
const selectPreviousDraft = createSelector(
  selectEditor,
  (state: EditorState) => {
    if (!state.source) return;
    const history = state.codeDrafts[state.source.domain];
    if (history?.version === state.source.version) {
      return history.code;
    }
  }
);
const selectCanRedo = createSelector(
  selectCurrentDraft,
  selectPreviousDraft,
  (current, history) =>
    history !== undefined && (current || '') !== (history || '')
);
const selectLspStatus = createSelector(
  selectEditor,
  (editor) => editor.lspStatus
);
const selectLspLogs = createSelector(selectEditor, (editor) => editor.lspLogs);

export const Editor = {
  action: EditorSlice.actions,
  select: {
    urlHistory: selectUrlHistory,
    currentSource: selectCurrentSource,
    currentContent: selectCurrentContent,
    currentDraft: selectCurrentDraft,
    previousDraft: selectPreviousDraft,
    canUndo: selectCanUndo,
    canRedo: selectCanRedo,
    lspStatus: selectLspStatus,
    lspLogs: selectLspLogs,
  },
};

//
// Persist state
//
const blacklist: Array<keyof EditorState> = [
  // items to exclude from local storage
  'code',
  'draft',
  'source',
  'lspLogs',
  'lspStatus',
];

const store = idb.createStore('lncrawl', 'editor');

export const editorPersistConfig: PersistConfig<EditorState> = {
  key: 'editor',
  version: 1,
  blacklist,
  storage: {
    getItem: (key) => idb.get(key, store),
    removeItem: (key) => idb.del(key, store),
    setItem: (key, value) => idb.set(key, value, store),
  },
};
