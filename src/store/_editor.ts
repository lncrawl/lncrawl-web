import type { SourceItem } from '@/types';
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
  current: {
    code: string;
    draft: string;
    source: SourceItem;
  } | null;
  codeDrafts: Record<string, CodeDraft | undefined>;
  urlHistory: Record<string, DomainHistory[] | undefined>;
}

const initialState: EditorState = {
  current: null,
  codeDrafts: {},
  urlHistory: {},
};

export const EditorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCurrent(
      state,
      action: PayloadAction<null | { code: string; source: SourceItem }>
    ) {
      if (!action.payload) {
        state.current = null;
      } else {
        state.current = {
          code: action.payload.code,
          draft: action.payload.code,
          source: action.payload.source,
        };
      }
    },
    saveDraft(state, action: PayloadAction<string>) {
      // payload -> draft ; draft -> history
      if (state.current && state.current.draft !== action.payload) {
        state.current.draft = action.payload;
        state.codeDrafts[state.current.source.domain] = {
          code: action.payload,
          version: state.current.source.version,
        };
      }
    },
    undo(state) {
      // draft -> history ; code -> draft
      if (state.current) {
        state.codeDrafts[state.current.source.domain] = {
          code: state.current.draft,
          version: state.current.source.version,
        };
        state.current.draft = state.current.code;
      }
    },
    redo(state) {
      // history -> draft ; pop history
      if (state.current) {
        const domain = state.current.source.domain;
        const history = state.codeDrafts[domain];
        if (history?.version === state.current.source.version) {
          state.current.draft = history.code;
          delete state.codeDrafts[domain];
        }
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
  (editor) => editor.current?.source
);
const selectCurrentContent = createSelector(
  selectEditor,
  (editor) => editor.current?.code
);
const selectCurrentDraft = createSelector(
  selectEditor,
  (editor) => editor.current?.draft
);
const selectCanUndo = createSelector(
  selectCurrentContent,
  selectCurrentDraft,
  (original, current) => (original || '') != (current || '')
);
const selectPreviousDraft = createSelector(
  selectEditor,
  (state: EditorState) => {
    if (!state.current) return;
    const history = state.codeDrafts[state.current.source.domain];
    if (history?.version === state.current.source.version) {
      return history.code;
    }
  }
);
const selectCanRedo = createSelector(
  selectCurrentDraft,
  selectPreviousDraft,
  (current, history) => (current || '') != (history || '')
);

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
  },
};

//
// Persist state
//
const blacklist: Array<keyof EditorState> = [
  // items to exclude from local storage
  'current',
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
