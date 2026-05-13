import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { throttle } from 'lodash-es';
import { editorRef } from './EditorRef';
import { lspFlushRef } from './useLsp';

export const handleSave = throttle(() => {
  const state = editorRef.current;
  if (!state) return;
  const code = state.editor.getValue();
  store.dispatch(Editor.action.saveDraft(code));
}, 100);

export const handleFormat = throttle(() => {
  const state = editorRef.current;
  if (!state) return;
  lspFlushRef.current?.();
  state.editor.getAction('editor.action.formatDocument')?.run();
}, 100);

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
  const state = editorRef.current;
  if (state) {
    const original = Editor.select.currentContent(store.getState());
    state.editor.setValue(original || '');
  }
  handleSave.cancel();
  handleRedo.cancel();
  handleUndo.cancel();
  handleFormat.cancel();
  store.dispatch(Editor.action.clear());
}, 100);
