export default function CourtDivider() {
  return (
    <div className="relative flex items-center justify-center py-10" aria-hidden="true">
      {/* faint full-width base line */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-court-line to-transparent" />

      {/* seam mark — echoes a basketball's stitched seam, offset chevrons around a diamond */}
      <div className="relative flex items-center gap-3 bg-court-black px-6">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-mainstream-orange/60" />
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2 L24 14 L14 26 L4 14 Z"
            stroke="#F15A24"
            strokeWidth="1.5"
            fill="#0A0A0A"
          />
          <path d="M14 2 L14 26" stroke="#F15A24" strokeWidth="1" opacity="0.4" />
          <path d="M4 14 L24 14" stroke="#F15A24" strokeWidth="1" opacity="0.4" />
        </svg>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-mainstream-orange/60" />
      </div>
    </div>
  );
}
