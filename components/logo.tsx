// Logo icon mark is a hand-coded SVG matching the Canva brand design.
// A white-wordmark PNG variant (for dark/teal backgrounds, emails, etc.)
// is stored at /public/images/logo-white-wordmark.png.

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ''}`}>
      {/*
        Icon mark: three orange elements forming a stylised person inside a G.
          1. Head — circle at top
          2. Left bar — tall vertical stroke (the path/stem)
          3. G arc — near-circle open at upper-right, with horizontal crossbar
        viewBox 100×165 rendered at 32×53 px so proportions match the brand asset.
      */}
      <svg
        width="32"
        height="53"
        viewBox="0 0 100 165"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head dot */}
        <circle cx="58" cy="16" r="14" fill="#F97316" />
        {/* Left vertical bar */}
        <line
          x1="20"
          y1="38"
          x2="20"
          y2="158"
          stroke="#F97316"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* G arc — large counter-clockwise arc, opening at upper-right */}
        <path
          d="M 78 50 A 40 40 0 1 0 98 90"
          stroke="#F97316"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        {/* G crossbar — horizontal bar extending inward from arc end */}
        <line
          x1="98"
          y1="90"
          x2="72"
          y2="90"
          stroke="#F97316"
          strokeWidth="18"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark — dark variant for white/light backgrounds */}
      <span className="text-[17px] font-bold leading-none tracking-[-0.01em]">
        <span className="text-[#0D6E6E]">Grant</span>
        <span className="text-[#1E293B]">Pathway</span>
      </span>
    </span>
  )
}
