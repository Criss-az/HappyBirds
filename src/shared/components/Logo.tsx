/** Ave cantora posada en una rama. Los colores salen de los tokens --logo-*. */
export function BirdMark({ size = 32 }: { size?: number }) {
  return (
    <svg className="bird" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <g transform="translate(-3 0)">
        <path
          className="bird__body"
          d="M24.1 8.9C23.5 6.6 21.7 5.4 19.8 5.4 17.3 5.4 15.5 7.3 15.5 9.8c0 2.7-1.5 4.7-3.5 6.7L6.2 24.9l-1.8 2.9 6-1.8c2.3.8 5.1.8 7.6-.6 4-2.2 6.6-6 6.6-10.4 0-1.4-.2-2.6-.6-3.6z"
        />
        <path className="bird__accent" d="M24 8.8 28.6 10.3 24 11.7z" />
        <circle className="bird__eye" cx="20.6" cy="9.2" r="1.1" />
        <path className="bird__eye" d="M19.6 14.8c2 2.6 0 6.8-8.8 7.4.8-3.4 3.6-7 8.8-7.4z" />
        <path className="bird__legs" d="M15.4 26.2v2.2M18.8 25.6v2.8M10.4 29.2h15" fill="none" />
      </g>
      <path className="bird__song" d="M27.6 8.4a2.6 2.6 0 0 1 0 3.8M29 6.8a4.2 4.2 0 0 1 0 7" />
    </svg>
  )
}
