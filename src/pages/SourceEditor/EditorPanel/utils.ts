import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { throttle } from 'lodash-es';
import { editorRef } from './EditorRef';

export const handleUndo = throttle(() => {
  const editor = editorRef.current;
  if (!editor) return;
  const model = editor.getModel();
  if (model?.canUndo()) {
    return model.undo();
  }
  const canUndo = Editor.select.canUndo(store.getState());
  if (canUndo) {
    store.dispatch(Editor.action.undo(editor.getValue()));
  }
  // model?.popStackElement();
}, 100);

export const handleRedo = throttle(() => {
  const editor = editorRef.current;
  if (!editor) return;
  const model = editor.getModel();
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
