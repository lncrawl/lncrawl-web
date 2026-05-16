import { useEffect } from 'react';

/**
 * Sets `--visual-vh` and `--visual-vw` CSS custom properties on <html>
 * whenever the visual viewport resizes (e.g. soft keyboard open/close).
 *
 * Usage in CSS:
 * ```
 *   height: calc(100 * var(--visual-vh));
 *   width:  calc(100 * var(--visual-vw));
 * ```
 */
export function VisualViewportProvider() {
  useEffect(() => {
    const root = document.documentElement;

    function update() {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      const width = vv ? vv.width : window.innerWidth;

      root.style.setProperty('--visual-vh', `${height * 0.01}px`);
      root.style.setProperty('--visual-vw', `${width * 0.01}px`);
    }

    update();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update); // iOS Safari shifts viewport on scroll
    } else {
      window.addEventListener('resize', update);
    }

    return () => {
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      } else {
        window.removeEventListener('resize', update);
      }
    };
  }, []);
  return null;
}
