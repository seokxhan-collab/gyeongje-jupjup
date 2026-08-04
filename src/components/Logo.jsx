export default function Logo({ size = 38 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="경제줍줍 로고"
    >
      <rect width="40" height="40" rx="11" fill="url(#logo-gradient)" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b6df0" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <path
        d="M9 25 L16 18 L21 22 L31 10"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 10 H31 V17"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="9" cy="25" r="1.9" fill="#fff" />
      <circle cx="16" cy="18" r="1.9" fill="#fff" fillOpacity="0.9" />
      <circle cx="21" cy="22" r="1.9" fill="#fff" fillOpacity="0.9" />
    </svg>
  )
}
