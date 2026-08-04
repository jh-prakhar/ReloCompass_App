interface BrandIconProps {
  className?: string;
  variant?: "dark" | "light";
  size?: number;
}

/**
 * ReloCompass brand icon — a compass rose inside a location pin.
 * Dark variant: cream strokes on navy fill (for light backgrounds)
 * Light variant: cream strokes on transparent (for dark backgrounds)
 */
export function BrandIcon({ className = "", variant = "dark", size = 40 }: BrandIconProps) {
  const bgFill = variant === "dark" ? "#1E2A45" : "none";
  const strokeColor = "#F6EFE2";
  const needleNorth = "#F6EFE2";
  const needleSouth = "#C1552C";
  const centerDot = variant === "dark" ? "#1E2A45" : "#F6EFE2";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ReloCompass"
    >
      <rect width="200" height="200" rx="44" fill={bgFill} />
      <g transform="translate(34,24) scale(0.94)">
        <path
          d="M 60 6 C 32 6 10 28 10 56 C 10 85 36 108 60 137 C 84 108 110 85 110 56 C 110 28 88 6 60 6 Z"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="58" r="34" fill="none" stroke={strokeColor} strokeWidth="3.5" />
        <line x1="60" y1="24" x2="60" y2="15" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="60" y1="92" x2="60" y2="101" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="94" y1="58" x2="103" y2="58" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="26" y1="58" x2="17" y2="58" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
        <polygon points="53,58 60,21 67,58" fill={needleNorth} />
        <polygon points="53,58 60,123 67,58" fill={needleSouth} />
        <circle cx="60" cy="58" r="7" fill={centerDot} stroke={strokeColor} strokeWidth="2.5" />
      </g>
    </svg>
  );
}

interface BrandWordmarkProps {
  className?: string;
  variant?: "dark" | "light";
  showIcon?: boolean;
  iconSize?: number;
  textSize?: string;
}

/**
 * ReloCompass full wordmark — icon + "ReloCompass" text.
 * Dark variant: navy text (for light backgrounds)
 * Light variant: cream text (for dark backgrounds)
 */
export function BrandWordmark({
  className = "",
  variant = "dark",
  showIcon = true,
  iconSize = 40,
  textSize = "text-xl",
}: BrandWordmarkProps) {
  const textColor = variant === "dark" ? "text-[#1E2A45]" : "text-[#F6EFE2]";

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showIcon && <BrandIcon size={iconSize} variant={variant} />}
      <span className={`font-bold ${textColor} ${textSize} tracking-tight`}>
        Relo<span className="text-[#C1552C]">Compass</span>
      </span>
    </span>
  );
}
