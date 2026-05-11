import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import type { RootState } from '.';

export interface EditorState {
  panelSizes: [number | undefined, number | undefined];
  panelConfig: {
    panel1: { min: number };
    panel2: { min: number; default: number };
  };
}

const initialState: EditorState = {
  panelSizes: [undefined, 380],
  panelConfig: {
    panel1: { min: 500 },
    panel2: { min: 300, default: 380 },
  },
};

export const EditorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setPanelSizes(state, action: PayloadAction<[number, number]>) {
      state.panelSizes = [...action.payload];
    },
    toggleEditorCollapse(state) {
      const [a, b] = state.panelSizes;
      const total = a! + b!;
      if (a !== 0) {
        state.panelSizes = [0, total];
      } else {
        const m1 = state.panelConfig.panel1.min;
        const m2 = state.panelConfig.panel2.min;
        if (m1 + m2 > total) {
          state.panelSizes = [total, 0];
        } else {
          const p2 = state.panelConfig.panel2.default;
          const na = Math.max(m1, Math.min(total * 0.7, total - p2));
          state.panelSizes = [na, total - na];
        }
      }
    },
    toggleTestPanelCollapse(state) {
      const [a, b] = state.panelSizes;
      const total = a! + b!;
      if (b !== 0) {
        state.panelSizes = [total, 0];
      } else {
        const m1 = state.panelConfig.panel1.min;
        const m2 = state.panelConfig.panel2.min;
        if (m1 + m2 > total) {
          state.panelSizes = [0, total];
        } else {
          const p2 = state.panelConfig.panel2.default;
          const na = Math.max(m1, Math.min(total * 0.7, total - p2));
          state.panelSizes = [na, total - na];
        }
      }
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
  },
};

//
// Persist Config
//
const blacklist: Array<keyof EditorState> = [
  // items to exclude from local storage
  'panelSizes',
];

export const editorPersistConfig: PersistConfig<EditorState> = {
  key: 'editor',
  version: 1,
  storage,
  blacklist,
};
