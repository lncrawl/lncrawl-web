import { loader, type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEffect, useState } from 'react';

interface EditorState {
  monaco: Monaco;
  editor: editor.IStandaloneCodeEditor;
}

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' },
});

class EditorRef {
  private _id = 0;
  private _state?: EditorState;

  get current(): EditorState | null {
    return this._state ?? null;
  }

  set current(value: EditorState) {
    this._id++;
    this._state = value;
  }

  get id() {
    return this._id;
  }
}

export const editorRef = new EditorRef();

export const useCurrentEditor = () => {
  const [state, setState] = useState(editorRef.current);

  useEffect(() => {
    let lastId = editorRef.id;
    const iid = setInterval(() => {
      if (lastId !== editorRef.id) {
        setState(editorRef.current);
        lastId = editorRef.id;
      }
    }, 100);
    return () => clearInterval(iid);
  }, []);

  return state;
};
