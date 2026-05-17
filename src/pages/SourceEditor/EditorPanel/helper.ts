export function shouldShowKeyboard(): boolean {
  const hasVirtualKeyboard = 'virtualKeyboard' in navigator;
  const isTouchOnly =
    window.matchMedia('(pointer: coarse)').matches &&
    !window.matchMedia('(pointer: fine)').matches;
  return !hasVirtualKeyboard && isTouchOnly;
}
