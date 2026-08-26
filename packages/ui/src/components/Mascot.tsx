import type { ReactElement } from "react";

interface MascotProps {
  className?: string;
}

/**
 * PTE brand mascot: a friendly headphone-wearing study robot.
 *
 * Colours are literal SVG fills rather than Tailwind tokens because this is
 * artwork, not themeable UI — same rationale as the SSO brand marks. Swap this
 * component's body for an <Image> if a rendered asset is provided later.
 */
export const Mascot = ({ className }: MascotProps): ReactElement => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    role="img"
    aria-label="PTE mascot"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>PTE mascot</title>
    <defs>
      <linearGradient id="pteMascotBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6BA8FF" />
        <stop offset="1" stopColor="#3B7DED" />
      </linearGradient>
      <linearGradient id="pteMascotGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8FE3FF" />
        <stop offset="1" stopColor="#39C6FF" />
      </linearGradient>
    </defs>

    {/* Headphone band arching over the head */}
    <path
      d="M40 96 Q40 40 100 40 Q160 40 160 96"
      fill="none"
      stroke="#DCE6F5"
      strokeWidth="12"
      strokeLinecap="round"
    />

    {/* Feet */}
    <ellipse cx="82" cy="177" rx="13" ry="9" fill="#2F6BD6" />
    <ellipse cx="118" cy="177" rx="13" ry="9" fill="#2F6BD6" />

    {/* Body */}
    <rect
      x="46"
      y="56"
      width="108"
      height="120"
      rx="52"
      fill="url(#pteMascotBody)"
    />

    {/* Arms */}
    <ellipse cx="47" cy="122" rx="12" ry="21" fill="#4C8BF0" />
    <ellipse cx="153" cy="122" rx="12" ry="21" fill="#4C8BF0" />

    {/* Book tucked under the right arm */}
    <rect x="150" y="118" width="18" height="34" rx="3" fill="#F4A15E" />
    <rect x="146" y="122" width="18" height="34" rx="3" fill="#6FC7E8" />

    {/* Face plate */}
    <rect x="64" y="70" width="72" height="66" rx="33" fill="#F5FAFF" />

    {/* Happy closed eyes */}
    <path
      d="M80 98 Q86 90 92 98"
      fill="none"
      stroke="#3A4A63"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M108 98 Q114 90 120 98"
      fill="none"
      stroke="#3A4A63"
      strokeWidth="4.5"
      strokeLinecap="round"
    />

    {/* Smile */}
    <path
      d="M88 110 Q100 122 112 110"
      fill="none"
      stroke="#3A4A63"
      strokeWidth="4.5"
      strokeLinecap="round"
    />

    {/* Ear cups */}
    <rect x="31" y="86" width="23" height="36" rx="11" fill="#3A4A63" />
    <rect x="146" y="86" width="23" height="36" rx="11" fill="#3A4A63" />

    {/* Glowing "E" badge on the belly */}
    <rect
      x="85"
      y="142"
      width="30"
      height="27"
      rx="8"
      fill="url(#pteMascotGlow)"
    />
    <text
      x="100"
      y="162"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize="18"
      fontWeight="700"
      fill="#EAF9FF"
    >
      E
    </text>
  </svg>
);
