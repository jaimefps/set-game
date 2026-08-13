import React from "react"
import { Colors, Shapes, Inners } from "./GameState"

const COLOR_MAP: Record<Colors, string> = {
  red: "#e5484d",
  green: "#30a46c",
  purple: "#8e4ec6",
}

// One symbol drawn in a 120x56 viewBox. Stripe fills use a per-color
// SVG pattern so symbols stay crisp at any size.
export const CardSymbol: React.FC<{
  color: Colors
  shape: Shapes
  inner: Inners
}> = ({ color, shape, inner }) => {
  const stroke = COLOR_MAP[color]
  const patternId = `stripe-${color}`
  const fill =
    inner === "solid"
      ? stroke
      : inner === "stripe"
      ? `url(#${patternId})`
      : "none"

  return (
    <svg className="symbol" viewBox="0 0 120 56" role="img" aria-hidden>
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="120"
          height="5"
        >
          <line x1="0" y1="2.5" x2="120" y2="2.5" stroke={stroke} strokeWidth="1.6" />
        </pattern>
      </defs>
      {shape === "circle" && (
        <rect
          x="8"
          y="8"
          width="104"
          height="40"
          rx="20"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
        />
      )}
      {shape === "diamond" && (
        <polygon
          points="60,5 113,28 60,51 7,28"
          strokeLinejoin="round"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
        />
      )}
      {shape === "tilde" && (
        <path
          d="M 12 44
             C 2 32, 10 14, 26 11
             C 40 8, 52 18, 64 22
             C 76 26, 86 20, 93 13
             C 101 5, 114 10, 116 21
             C 118 33, 110 45, 96 46
             C 82 47, 74 38, 60 35
             C 48 32, 38 42, 27 47
             C 18 51, 15 48, 12 44
             Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="3.5"
        />
      )}
    </svg>
  )
}
