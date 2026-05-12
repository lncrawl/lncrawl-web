import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { throttle } from 'lodash-es';
import { editorRef } from './EditorRef';

export const handleUndo = throttle(() => {
  const state = editorRef.current;
  if (!state) return;
  const model = state.editor.getModel();
  if (model?.canUndo()) {
    return model.undo();
  }
  const canUndo = Editor.select.canUndo(store.getState());
  if (canUndo) {
    store.dispatch(Editor.action.undo(state.editor.getValue()));
  }
  // model?.popStackElement();
}, 100);

export const handleRedo = throttle(() => {
  const state = editorRef.current;
  if (!state) return;
  const model = state.editor.getModel();
  if (model?.canRedo()) {
    return model.redo();
  }
  const canRedo = Editor.select.canRedo(store.getState());
  if (canRedo) {
    store.dispatch(Editor.action.redo());
  }
}, 100);

export const handleClear = throttle(() => {
  store.dispatch(Editor.action.clear());
}, 100);
