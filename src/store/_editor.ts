import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import * as idb from 'idb-keyval';
import type { PersistConfig } from 'redux-persist';
import type { RootState } from '.';

const MAX_HISTORY_PER_DOMAIN = 50;

export interface DomainHistory {
  url: string;
  time: number;
}

interface EditorState {
  panelSizes: [number | undefined, number | undefined];
  panelConfig: {
    panel1: { min: number };
    panel2: { min: number; default: number };
  };
  urlHistory: Record<string, DomainHistory[]>;
}

const initialState: EditorState = {
  urlHistory: {},
  panelSizes: [undefined, undefined],
  panelConfig: {
    panel1: { min: 500 },
    panel2: { min: 300, default: 450 },
  },
};

export const EditorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setPanelSizes(state, action: PayloadAction<EditorState['panelSizes']>) {
      state.panelSizes = [...action.payload];
    },
    toggleEditorPanel(state) {
      const [a, b] = state.panelSizes;
      const total = a && b ? a + b : undefined;
      if (a !== 0) {
        state.panelSizes = [0, total];
      } else if (total) {
        const m1 = state.panelConfig.panel1.min;
        const m2 = state.panelConfig.panel2.min;
        if (m1 + m2 > total) {
          state.panelSizes = [total, 0];
        } else {
          const p2 = state.panelConfig.panel2.default;
          const na = Math.max(m1, Math.min(total * 0.7, total - p2));
          state.panelSizes = [na, total - na];
        }
      } else {
        state.panelSizes = [undefined, undefined];
      }
    },
    toggleTestPanel(state) {
      const [a, b] = state.panelSizes;
      const total = a && b ? a + b : undefined;
      if (b !== 0) {
        state.panelSizes = [total, 0];
      } else if (total) {
        const m1 = state.panelConfig.panel1.min;
        const m2 = state.panelConfig.panel2.min;
        if (m1 + m2 > total) {
          state.panelSizes = [0, total];
        } else {
          const p2 = state.panelConfig.panel2.default;
          const na = Math.max(m1, Math.min(total * 0.7, total - p2));
          state.panelSizes = [na, total - na];
        }
      } else {
        state.panelSizes = [undefined, undefined];
      }
    },
    addNovelUrl(state, action: PayloadAction<{ domain: string; url: string }>) {
      const { domain, url } = action.payload;
      const item: DomainHistory = {
        url,
        time: Date.now(),
      };
      const history = (state.urlHistory[domain] || [])
        .filter((x) => x.url !== url)
        .slice(0, MAX_HISTORY_PER_DOMAIN - 1);
      state.urlHistory[domain] = [item, ...history];
    },
    clearUrlHistory(state, action: PayloadAction<{ domain: string }>) {
      const { domain } = action.payload;
      state.urlHistory[domain] = [];
    },
  },
});

const selectEditor = (state: RootState) => state.editor;

export const Editor = {
  action: EditorSlice.actions,
  select: {
    panelSizes: createSelector(selectEditor, (editor) => editor.panelSizes),
    panelConfig: createSelector(selectEditor, (editor) => editor.panelConfig),
    editorPanelCollapsed: createSelector(
      selectEditor,
      (editor) => editor.panelSizes[0] === 0
    ),
    testPanelCollapsed: createSelector(
      selectEditor,
      (editor) => editor.panelSizes[1] === 0
    ),
    getHistory: (domain: string) =>
      createSelector(selectEditor, (editor) => editor.urlHistory[domain] || []),
  },
};

//
// Persist Config
//
const blacklist: Array<keyof EditorState> = [
  // items to exclude from local storage
  'panelSizes',
];

const store = idb.createStore('lncrawl', 'editor');

export const editorPersistConfig: PersistConfig<EditorState> = {
  key: 'editor',
  version: 3,
  blacklist,
  storage: {
    getItem: (key) => idb.get(key, store),
    removeItem: (key) => idb.del(key, store),
    setItem: (key, value) => idb.set(key, value, store),
  },
};
