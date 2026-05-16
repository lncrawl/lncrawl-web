import { store } from '@/store';
import { Editor } from '@/store/_editor';
import { loader } from '@monaco-editor/react';
import { Mutex } from 'async-mutex';
import { throttle } from 'lodash-es';
import type * as Monaco from 'monaco-editor';
import { useEffect, useState } from 'react';
import { lspFlushRef } from './LanguageServer';

interface EditorState {
  readOnly: boolean;
  monaco: typeof Monaco;
  editor: Monaco.editor.IStandaloneCodeEditor;
}

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' },
});

class CurrentEditor {
  private _lock = new Mutex();
  private _state: EditorState;
  private _aborter = new AbortController();

  constructor(value: EditorState) {
    this._state = value;
    this._lock.runExclusive(this.initText);
  }

  dispose() {
    this.cancel();
    this._aborter.abort();
  }

  get editor() {
    return this._state.editor;
  }

  get monaco() {
    return this._state.monaco;
  }

  get readOnly() {
    return this._state.readOnly;
  }

  private cancel = () => {
    this.save.cancel();
    this.undo.cancel();
    this.redo.cancel();
    this.format.cancel();
  };

  private initText = () => {
    const state = store.getState();
    const code = Editor.select.currentCode(state);
    const model = this.editor.getModel()!;
    model.setValue(code || '');
    if (!this.readOnly) {
      const range = model.getFullModelRange();
      const selection = this.editor.getSelection();
      const draft = Editor.select.currentDraft(state);
      if (draft !== code) {
        model.pushEditOperations([], [{ range, text: draft }], () =>
          selection ? [selection] : []
        );
      }
    }
  };

  setReadOnly = (value: boolean) => {
    if (value === this._state.readOnly) return;
    this.cancel();
    this._state.readOnly = value;
    this._lock.runExclusive(this.initText);
  };

  format = throttle(() => {
    this._lock.runExclusive(() => {
      lspFlushRef.current?.();
      this.editor.getAction('editor.action.formatDocument')?.run();
    });
  }, 100);

  save = throttle(() => {
    this._lock.runExclusive(() => {
      const code = this.editor.getValue();
      const text = Editor.select.currentDraft(store.getState());
      if (code === text) return;
      store.dispatch(Editor.action.pushCodeChange(code));
    });
  }, 100);

  undo = throttle(() => {
    this._lock.runExclusive(() => {
      const model = this.editor.getModel();
      if (!model?.canUndo()) return;
      store.dispatch(Editor.action.popCodeChange());
      return model.undo();
    });
  }, 100);

  redo = throttle(() => {
    this._lock.runExclusive(() => {
      const model = this.editor.getModel();
      if (!model?.canRedo()) return;
      return model.redo();
    });
  }, 100);

  clear = () => {
    this.cancel();
    this._lock.runExclusive(() => {
      store.dispatch(Editor.action.popCodeChange());
      const text = Editor.select.currentDraft(store.getState());
      this.editor.setValue(text || '');
    });
  };
}

let current: CurrentEditor | undefined;
const watchers: Set<() => any> = new Set();

export const getCurrentEditor = () => {
  return current;
};

export const setCurrentEditor = (value: EditorState | null) => {
  current?.dispose();
  if (value) {
    current = new CurrentEditor(value);
  } else {
    current = undefined;
  }
  for (const watcher of watchers) {
    watcher();
  }
  return current;
};

export const useCurrentEditor = () => {
  const [value, setValue] = useState(current);

  useEffect(() => {
    const update = () => {
      setValue(current);
    };
    watchers.add(update);
    return () => {
      watchers.delete(update);
    };
  }, []);

  return value;
};
