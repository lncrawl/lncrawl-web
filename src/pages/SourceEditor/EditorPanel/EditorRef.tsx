import type { editor } from 'monaco-editor';
import { useEffect, useState } from 'react';

class EditorRef {
  private _id = 0;
  private _current?: editor.IStandaloneCodeEditor;

  get current(): editor.IStandaloneCodeEditor | null {
    return this._current ?? null;
  }

  set current(value: editor.IStandaloneCodeEditor) {
    this._id++;
    this._current = value;
  }

  get id() {
    return this._id;
  }
}

const editorRef = new EditorRef();

export const useEditorRef = () => {
  return editorRef;
};

export const useCurrentEditor = () => {
  const [editor, setEditor] = useState(editorRef.current);

  useEffect(() => {
    let lastId = editorRef.id;
    const iid = setInterval(() => {
      if (lastId !== editorRef.id) {
        setEditor(editorRef.current);
        lastId = editorRef.id;
      }
    }, 100);
    return () => clearInterval(iid);
  }, []);

  return editor;
};
