import { useEffect, useRef, useState } from "react";

/**
 * Cell size that fits a board into its box. Width always counts; height only
 * from md up, where the board sits beside its controls in a fixed-height stage.
 * Never goes below minCell: the board scrolls sideways instead.
 */
export function useFitCell(unitsW: number, unitsH: number, chromeW: number, chromeH: number, minCell: number, maxCell: number, fitHeight = true) {
  const box = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(minCell);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const w = (el.clientWidth - chromeW) / unitsW;
      const fitH = fitHeight && window.matchMedia("(min-width: 768px)").matches;
      const h = fitH ? (el.clientHeight - chromeH) / unitsH : Infinity;
      setCell(Math.max(minCell, Math.min(maxCell, Math.floor(Math.min(w, h)))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [unitsW, unitsH, chromeW, chromeH, minCell, maxCell, fitHeight]);
  return { box, cell };
}
