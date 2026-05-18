interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Icon mark — stylised G with person motif */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head dot */}
        <circle cx="13" cy="5" r="3.5" fill="#F97316" />
        {/* Stem */}
        <rect x="11.25" y="9.5" width="3.5" height="7" rx="1.75" fill="#F97316" />
        {/* G arc */}
        <path
          d="M24 14.5h-6.5v3.5H21a6.5 6.5 0 1 1-1.9-4.6"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-[17px] font-bold leading-none tracking-[-0.01em]">
        <span className="text-[#0D6E6E]">Grant</span>
        <span className="text-[#1E293B]">Pathway</span>
      </span>
    </span>
  );
}
