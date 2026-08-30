import { cn } from '@/lib/cn'

/**
 * Illustration for the "being built" page.
 *
 * Drawn inline rather than shipped as an asset: it costs no extra request, it
 * stays sharp at any size, and it reads the theme's own CSS variables, so it can
 * never drift out of sync with the palette the way a flat PNG would.
 *
 * The picture is a screen mid-assembly. Two blocks are placed, one outline is
 * still empty, and one is being lowered into it on a line.
 */
export function UnderConstruction({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      role="img"
      aria-label="An interface being assembled, with one block still being lowered into place"
      className={cn('h-auto', className)}
    >
      <defs>
        {/* Blueprint grid, faded out towards the edges so it has no hard border. */}
        <pattern id="uc-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" stroke="var(--line)" strokeWidth="1" />
        </pattern>
        <radialGradient id="uc-fade" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="uc-mask">
          <rect width="320" height="220" fill="url(#uc-fade)" />
        </mask>
      </defs>

      <rect width="320" height="220" fill="url(#uc-grid)" mask="url(#uc-mask)" />

      {/* the screen being built */}
      <rect
        x="58"
        y="52"
        width="204"
        height="140"
        rx="14"
        fill="var(--surface)"
        stroke="var(--line)"
        strokeWidth="2"
      />

      {/* title bar */}
      <rect x="74" y="68" width="60" height="9" rx="4.5" fill="var(--accent)" opacity="0.85" />
      <rect x="140" y="68" width="34" height="9" rx="4.5" fill="var(--line)" />

      {/* blocks already placed */}
      <rect x="74" y="92" width="80" height="40" rx="8" fill="var(--accent)" opacity="0.14" />
      <rect x="74" y="92" width="80" height="40" rx="8" stroke="var(--accent)" opacity="0.35" />
      <rect x="74" y="142" width="172" height="10" rx="5" fill="var(--line)" />
      <rect x="74" y="160" width="120" height="10" rx="5" fill="var(--line)" />

      {/* the empty slot waiting for the block above it */}
      <rect
        x="166"
        y="92"
        width="80"
        height="40"
        rx="8"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeDasharray="6 5"
        opacity="0.55"
      />

      {/* crane arm and cable */}
      <path
        d="M206 10h72"
        stroke="var(--ink)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path d="M206 10v10" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      <path d="M240 10v18" stroke="var(--line)" strokeWidth="2" />

      {/* the block on its way down */}
      <g className="uc-lower">
        <rect x="212" y="28" width="56" height="28" rx="7" fill="var(--accent)" />
        <rect x="221" y="38" width="24" height="4" rx="2" fill="var(--accent-fg)" opacity="0.85" />
        <rect x="221" y="46" width="16" height="4" rx="2" fill="var(--accent-fg)" opacity="0.5" />
      </g>

      {/* ground line */}
      <path
        d="M40 200h240"
        stroke="var(--line)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
      />

      <style>{`
        .uc-lower { animation: uc-bob 3.4s ease-in-out infinite; }
        @keyframes uc-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .uc-lower { animation: none; }
        }
      `}</style>
    </svg>
  )
}
