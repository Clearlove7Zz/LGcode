import { createUniqueId, type ComponentProps } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const filter = createUniqueId()
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 64"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="0.16" filter={`url(#${filter})`} mask={`url(#${mask})`} shape-rendering="crispEdges">
        <g fill="currentColor" transform="translate(0 8) scale(2)">
          <path d="M12 2h3v1h-3z M12 3h2v1h-2z M18 3h2v1h-2z M12 4h2v1h-2z M18 4h3v1h-3z M12 5h2v1h-2z M19 5h2v1h-2z M12 6h2v1h-2z M6 7h19v1h-19z M5 8h19v1h-19z M10 9h3v1h-3z M14 9h2v1h-2z M10 10h2v1h-2z M14 10h2v1h-2z M10 11h2v1h-2z M14 11h2v1h-2z M19 11h3v1h-3z M10 12h2v1h-2z M14 12h2v1h-2z M19 12h2v1h-2z M9 13h3v1h-3z M14 13h2v1h-2z M18 13h2v1h-2z M9 14h3v1h-3z M14 14h2v1h-2z M17 14h3v1h-3z M9 15h2v1h-2z M14 15h5v1h-5z M7 16h3v1h-3z M13 16h4v1h-4z M6 17h3v1h-3z M13 17h3v1h-3z M21 17h1v1h-1z M5 18h3v1h-3z M12 18h3v1h-3z M20 18h3v1h-3z M4 19h4v1h-4z M10 19h5v1h-5z M20 19h3v1h-3z M3 20h4v1h-4z M9 20h3v1h-3z M13 20h9v1h-9z M4 21h2v1h-2z M10 21h1v1h-1z M14 21h7v1h-7z" />
          <path d="M41 2h2v1h-2z M34 3h2v1h-2z M41 3h2v1h-2z M48 3h2v1h-2z M34 4h2v1h-2z M41 4h2v1h-2z M48 4h2v1h-2z M34 5h2v1h-2z M41 5h2v1h-2z M48 5h2v1h-2z M34 6h16v1h-16z M33 9h2v1h-2z M47 9h2v1h-2z M33 10h16v1h-16z M33 11h2v1h-2z M43 11h1v1h-1z M47 11h2v1h-2z M33 12h2v1h-2z M37 12h2v1h-2z M42 12h3v1h-3z M47 12h2v1h-2z M33 13h2v1h-2z M37 13h7v1h-7z M47 13h2v1h-2z M33 14h2v1h-2z M39 14h4v1h-4z M47 14h2v1h-2z M33 15h2v1h-2z M39 15h5v1h-5z M47 15h2v1h-2z M32 16h2v1h-2z M37 16h3v1h-3z M41 16h3v1h-3z M46 16h2v1h-2z M32 17h2v1h-2z M35 17h3v1h-3z M42 17h3v1h-3z M46 17h2v1h-2z M32 18h2v1h-2z M35 18h2v1h-2z M46 18h2v1h-2z M32 19h2v1h-2z M46 19h2v1h-2z M32 20h2v1h-2z M43 20h5v1h-5z M32 21h2v1h-2z M44 21h3v1h-3z" />
          <path d="M64 2h1v1h-1z M72 2h2v1h-2z M64 3h2v1h-2z M68 3h2v1h-2z M72 3h2v1h-2z M61 4h2v1h-2z M64 4h2v1h-2z M67 4h2v1h-2z M72 4h2v1h-2z M61 5h2v1h-2z M64 5h2v1h-2z M67 5h2v1h-2z M72 5h2v1h-2z M64 6h2v1h-2z M71 6h8v1h-8z M60 7h10v1h-10z M71 7h2v1h-2z M75 7h2v1h-2z M62 8h3v1h-3z M70 8h2v1h-2z M74 8h2v1h-2z M61 9h4v1h-4z M66 9h2v1h-2z M69 9h2v1h-2z M74 9h2v1h-2z M59 10h3v1h-3z M63 10h2v1h-2z M66 10h5v1h-5z M74 10h2v1h-2z M58 11h3v1h-3z M63 11h2v1h-2z M68 11h4v1h-4z M74 11h2v1h-2z M63 12h2v1h-2z M68 12h2v1h-2z M71 12h1v1h-1z M74 12h2v1h-2z M62 13h2v1h-2z M71 13h1v1h-1z M73 13h2v1h-2z M59 14h10v1h-10z M71 14h4v1h-4z M61 15h2v1h-2z M66 15h2v1h-2z M71 15h4v1h-4z M60 16h2v1h-2z M65 16h2v1h-2z M71 16h2v1h-2z M60 17h6v1h-6z M71 17h2v1h-2z M63 18h5v1h-5z M69 18h6v1h-6z M61 19h4v1h-4z M66 19h5v1h-5z M73 19h4v1h-4z M58 20h5v1h-5z M66 20h4v1h-4z M74 20h2v1h-2z M58 21h2v1h-2z M66 21h2v1h-2z M75 21h1v1h-1z" />
          <path d="M89 3h2v1h-2z M89 4h2v1h-2z M93 4h12v1h-12z M89 5h2v1h-2z M93 5h3v1h-3z M103 5h2v1h-2z M89 6h2v1h-2z M94 6h2v1h-2z M103 6h2v1h-2z M89 7h2v1h-2z M94 7h2v1h-2z M103 7h2v1h-2z M85 8h7v1h-7z M93 8h11v1h-11z M86 9h4v1h-4z M93 9h2v1h-2z M98 9h2v1h-2z M88 10h2v1h-2z M93 10h2v1h-2z M98 10h2v1h-2z M88 11h4v1h-4z M93 11h12v1h-12z M88 12h7v1h-7z M98 12h2v1h-2z M85 13h6v1h-6z M92 13h2v1h-2z M98 13h2v1h-2z M85 14h5v1h-5z M92 14h2v1h-2z M98 14h2v1h-2z M88 15h2v1h-2z M92 15h2v1h-2z M95 15h9v1h-9z M87 16h2v1h-2z M91 16h2v1h-2z M94 16h2v1h-2z M101 16h2v1h-2z M87 17h2v1h-2z M91 17h2v1h-2z M94 17h2v1h-2z M101 17h2v1h-2z M87 18h2v1h-2z M90 18h2v1h-2z M94 18h2v1h-2z M101 18h2v1h-2z M87 19h2v1h-2z M90 19h2v1h-2z M94 19h2v1h-2z M101 19h2v1h-2z M85 20h6v1h-6z M94 20h9v1h-9z M85 21h3v1h-3z M90 21h1v1h-1z M94 21h2v1h-2z M101 21h2v1h-2z" />
        </g>
      </g>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="220" height="64">
          <rect width="220" height="64" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="110" y1="0" x2="110" y2="64" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <filter
          id={filter}
          x="0"
          y="0"
          width="220"
          height="64"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4938_16028" />
        </filter>
      </defs>
    </svg>
  )
}
