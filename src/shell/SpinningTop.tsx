export default function SpinningTop({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2v4" />
      <path d="M5 9.5C5 8 8 6 12 6s7 2 7 3.5c0 2.5-4 7.5-7 12.5-3-5-7-10-7-12.5Z" />
      <path d="M5.4 10.5c1.8 1 4 1.5 6.6 1.5s4.8-.5 6.6-1.5" />
    </svg>
  );
}
