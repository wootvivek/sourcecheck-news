"use client";

import { computeSpectrum, BiasRating } from "@/lib/bias";

interface BiasDialProps {
  sources: string[];
  size?: number; // diameter in px, default 44
}

function ratingToAngle(rating: BiasRating): number {
  // Map -2..+2 to 180°..0° (left side of arc = left bias, right side = right bias)
  // -2 → 180°, -1 → 135°, 0 → 90°, 1 → 45°, 2 → 0°
  return 180 - ((rating + 2) / 4) * 180;
}

function ratingToColor(rating: BiasRating): string {
  const colors: Record<BiasRating, string> = {
    [-2]: "#3b82f6", // blue-500
    [-1]: "#38bdf8", // sky-400
    [0]: "#9ca3af",  // gray-400
    [1]: "#fb923c",  // orange-400
    [2]: "#ef4444",  // red-500
  };
  return colors[rating];
}

export default function BiasDial({ sources, size = 44 }: BiasDialProps) {
  const spectrum = computeSpectrum(sources);

  if (sources.length <= 1) return null;

  const r = size / 2;
  const arcRadius = r - 6; // inset for padding
  const cx = r;
  const cy = r; // center at bottom of semicircle
  const dotRadius = 3;

  // Compute average rating for needle
  const avgRating =
    spectrum.positions.reduce((sum, p) => sum + p.rating, 0) /
    spectrum.positions.length;
  const needleAngle = 180 - ((avgRating + 2) / 4) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = arcRadius - 4;
  const needleX = cx + needleLen * Math.cos(needleRad);
  const needleY = cy - needleLen * Math.sin(needleRad);

  // Arc path (semicircle from 180° to 0°, i.e., left to right)
  const arcStartX = cx - arcRadius;
  const arcStartY = cy;
  const arcEndX = cx + arcRadius;
  const arcEndY = cy;

  // Deduplicate dots by rating
  const ratingGroups = new Map<BiasRating, number>();
  for (const p of spectrum.positions) {
    ratingGroups.set(p.rating, (ratingGroups.get(p.rating) || 0) + 1);
  }

  return (
    <div
      className="relative"
      style={{ width: size, height: r + 4 }}
      title={spectrum.label}
    >
      <svg
        width={size}
        height={r + 4}
        viewBox={`0 ${cy - arcRadius - 8} ${size} ${arcRadius + 12}`}
      >
        {/* Gradient arc background */}
        <defs>
          <linearGradient id={`bias-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="25%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="75%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Semicircle arc */}
        <path
          d={`M ${arcStartX} ${arcStartY} A ${arcRadius} ${arcRadius} 0 0 1 ${arcEndX} ${arcEndY}`}
          fill="none"
          stroke={`url(#bias-grad-${size})`}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Source dots on arc */}
        {Array.from(ratingGroups.entries()).map(([rating, count]) => {
          const angle = ratingToAngle(rating);
          const rad = (angle * Math.PI) / 180;
          const dx = cx + arcRadius * Math.cos(rad);
          const dy = cy - arcRadius * Math.sin(rad);
          return (
            <g key={rating}>
              <circle
                cx={dx}
                cy={dy}
                r={dotRadius}
                fill={ratingToColor(rating)}
                stroke="white"
                strokeWidth="1.5"
              />
              {count > 1 && (
                <text
                  x={dx}
                  y={dy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="5"
                  fontWeight="bold"
                >
                  {count}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Needle pivot dot */}
        <circle cx={cx} cy={cy} r="2" fill="white" />

        {/* L / C / R labels */}
        <text x={cx - arcRadius - 1} y={cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontWeight="600">L</text>
        <text x={cx} y={cy - arcRadius - 3} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontWeight="600">C</text>
        <text x={cx + arcRadius + 1} y={cy + 7} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="6" fontWeight="600">R</text>
      </svg>
    </div>
  );
}
