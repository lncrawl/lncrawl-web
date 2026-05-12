import { Auth } from '@/store/_auth';
import { Grid } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const EDITOR_DEFAULT_SIZE = '65%';
const TESTER_DEFAULT_SIZE = '35%';

export const usePanelSizes = () => {
  const screen = Grid.useBreakpoint();
  const isAdmin = useSelector(Auth.select.isAdmin);

  const [editorSize, setEditorSize] = useState<number | string>(
    EDITOR_DEFAULT_SIZE
  );
  const [testerSize, setTesterSize] = useState<number | string>(
    TESTER_DEFAULT_SIZE
  );

  const isEditorCollapsed = useMemo(() => editorSize === 0, [editorSize]);
  const isTesterCollapsed = useMemo(() => testerSize === 0, [testerSize]);

  const collapseEditor = () => {
    setEditorSize(0);
    setTesterSize('100%');
  };

  const collapseTester = () => {
    setEditorSize('100%');
    setTesterSize(0);
  };

  const resetToDefaults = () => {
    setEditorSize(EDITOR_DEFAULT_SIZE);
    setTesterSize(TESTER_DEFAULT_SIZE);
  };

  const onToggleEditorCollapse = useCallback(() => {
    if (isEditorCollapsed) {
      if (screen.xl) {
        resetToDefaults();
      } else {
        collapseTester();
      }
    } else {
      collapseEditor();
    }
  }, [isEditorCollapsed, screen.xl]);

  const onToggleTestPanelCollapse = useCallback(() => {
    if (isTesterCollapsed) {
      if (screen.xl) {
        resetToDefaults();
      } else {
        collapseEditor();
      }
    } else {
      collapseTester();
    }
  }, [isTesterCollapsed, screen.xl]);

  useEffect(() => {
    if (screen.xl !== false) return;
    if (isTesterCollapsed || isEditorCollapsed) return;
    if (isAdmin) {
      collapseTester();
    } else {
      collapseTester();
    }
  }, [screen.xl, isEditorCollapsed, isTesterCollapsed]);

  return {
    editorSize,
    setEditorSize,
    testerSize,
    setTesterSize,
    isEditorCollapsed,
    isTesterCollapsed,
    onToggleEditorCollapse,
    onToggleTestPanelCollapse,
  };
};
