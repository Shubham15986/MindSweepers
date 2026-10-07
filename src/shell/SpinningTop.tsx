import { useId } from "react";

// Upright top: bands sweep across the body (axial spin), the whole top precesses around its tip,
// and a contact shadow breathes underneath. Only transform/opacity animate.
export default function SpinningTop({ size = 16, className = "", still = false }: { size?: number; className?: string; still?: boolean }) {
  const id = useId().replace(/:/g, "");
  const body = "M4 10c0-2.2 3.6-4 8-4s8 1.8 8 4c0 3-4 7-8 12.5C8 17 4 13 4 10Z";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={"overflow-visible " + className} aria-hidden>
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      <ellipse cx="12" cy="23" rx="4" ry=".8" fill="currentColor" className={still ? "opacity-20" : "st-shadow"} />
      <g className={still ? "" : "st-precess"}>
        <path d={body} fill="currentColor" fillOpacity=".14" />
        <g clipPath={`url(#${id})`}>
          <g className={still ? "" : "st-bands"} fill="currentColor">
            {[-16, -8, 0, 8, 16].map((x) => <rect key={x} x={x + 6} y="4" width="2.2" height="20" opacity=".45" />)}
          </g>
        </g>
        <path d={body} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
