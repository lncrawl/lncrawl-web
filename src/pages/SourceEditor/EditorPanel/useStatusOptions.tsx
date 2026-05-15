import { Auth } from '@/store/_auth';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentEditor } from './EditorRef';

export const useStatusOptions = () => {
  const editorRef = useCurrentEditor();
  const isAdmin = useSelector(Auth.select.isAdmin);

  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [tabSize, setTabSize] = useState(4);
  const [insertSpaces, setInserSpaces] = useState(true);
  const [canEditorUndo, setCanEditorUndo] = useState(false);
  const [canEditorRedo, setCanEditorRedo] = useState(false);

  // Switch between readonly mode
  useEffect(() => {
    if (!editorRef) return;
    editorRef.setReadOnly(!isAdmin);
  }, [isAdmin, editorRef]);

  // Save on change
  useEffect(() => {
    if (!editorRef) return;
    editorRef.editor.onDidChangeModelContent(editorRef.save);
  }, [editorRef]);

  // Update cursor position
  useEffect(() => {
    if (!editorRef) return;
    editorRef.editor.onDidChangeCursorPosition((e) => {
      setCursor({ line: e.position.lineNumber, col: e.position.column });
    });
  }, [editorRef]);

  // Update undo/redo state
  useEffect(() => {
    if (!editorRef) return;
    const model = editorRef.editor.getModel();
    if (!model) return;
    const updateModelInfo = () => {
      const opts = model.getOptions();
      setTabSize(opts.tabSize);
      setInserSpaces(opts.insertSpaces);
      setCanEditorUndo(model.canUndo());
      setCanEditorRedo(model.canRedo());
    };
    queueMicrotask(updateModelInfo);
    model.onDidChangeContent(updateModelInfo);
  }, [editorRef]);

  return {
    cursor,
    tabSize,
    insertSpaces,
    canRedo: canEditorRedo,
    canUndo: canEditorUndo,
  };
};

export type StatusOptionsState = ReturnType<typeof useStatusOptions>;
