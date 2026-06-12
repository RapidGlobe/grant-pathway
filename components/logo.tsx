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
        width="30"
        height="42"
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head dot */}
        <circle cx="58" cy="12" r="12" fill="#F97316" />
        {/* Left bar — curves at top sweeping right toward G arc */}
        <path
          d="M 20 118 L 20 48 Q 20 28 40 28"
          stroke="#F97316"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* G arc — large counter-clockwise arc, opening at upper-right */}
        <path
          d="M 78 42 A 34 34 0 1 0 96 76"
          stroke="#F97316"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* G crossbar — horizontal bar extending inward from arc end */}
        <line
          x1="96"
          y1="76"
          x2="74"
          y2="76"
          stroke="#F97316"
          strokeWidth="16"
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
