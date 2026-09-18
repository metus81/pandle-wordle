// A friendly panda built from simple shapes. Used in the header and the win modal.
export function PandaFace({
  size = 96,
  waving = false,
  className = "",
}: {
  size?: number
  waving?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Panda"
    >
      {/* Ears */}
      <circle cx="30" cy="28" r="16" fill="var(--panda-absent)" />
      <circle cx="90" cy="28" r="16" fill="var(--panda-absent)" />
      {/* Head */}
      <circle cx="60" cy="62" r="42" fill="#ffffff" stroke="var(--panda-absent)" strokeWidth="2" />
      {/* Eye patches */}
      <ellipse cx="43" cy="58" rx="13" ry="16" fill="var(--panda-absent)" transform="rotate(-18 43 58)" />
      <ellipse cx="77" cy="58" rx="13" ry="16" fill="var(--panda-absent)" transform="rotate(18 77 58)" />
      {/* Eyes */}
      <circle cx="45" cy="60" r="5" fill="#ffffff" />
      <circle cx="75" cy="60" r="5" fill="#ffffff" />
      <circle cx="46" cy="61" r="2.6" fill="var(--panda-absent)" />
      <circle cx="74" cy="61" r="2.6" fill="var(--panda-absent)" />
      {/* Cheeks */}
      <circle cx="38" cy="78" r="6" fill="var(--panda-pink)" opacity="0.8" />
      <circle cx="82" cy="78" r="6" fill="var(--panda-pink)" opacity="0.8" />
      {/* Nose + mouth */}
      <ellipse cx="60" cy="74" rx="5" ry="3.6" fill="var(--panda-absent)" />
      <path
        d="M60 78 Q54 86 48 82 M60 78 Q66 86 72 82"
        stroke="var(--panda-absent)"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Waving paw */}
      {waving && (
        <g className="panda-wave" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="104" cy="80" r="10" fill="var(--panda-absent)" />
        </g>
      )}
    </svg>
  )
}
