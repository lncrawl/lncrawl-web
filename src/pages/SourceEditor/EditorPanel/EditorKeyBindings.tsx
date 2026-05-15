import { useEffect } from 'react';
import { useCurrentEditor } from './EditorRef';

export const EditorKeyBindings: React.FC<any> = () => {
  const editorRef = useCurrentEditor();

  // Add custom commands
  useEffect(() => {
    if (!editorRef) return;
    const { KeyCode, KeyMod } = editorRef.monaco;
    editorRef.editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () =>
      editorRef.save()
    );
    editorRef.editor.addCommand(KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF, () =>
      editorRef.format()
    );
    editorRef.editor.addCommand(KeyMod.Shift | KeyMod.Alt | KeyCode.KeyO, () =>
      editorRef.format()
    );
  }, [editorRef]);

  return null;
};
