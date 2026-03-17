/**
 * Horizontal meter bar showing SourceCheck score (1–5).
 * Fills proportionally with score-based color gradient.
 */

interface SourceMeterProps {
  score: number;
  /** Actual number of sources (may exceed 5) */
  sourceCount?: number;
  /** Show "N sources" label next to the meter */
  showLabel?: boolean;
  /** Compact variant for tight spaces */
  compact?: boolean;
}

const METER_COLORS: Record<number, string> = {
  1: "bg-gray-300",
  2: "bg-amber-300",
  3: "bg-sky-300",
  4: "bg-lime-300",
  5: "bg-red-400 animate-pulse-glow",
};

export default function SourceMeter({
  score,
  sourceCount,
  showLabel = true,
  compact = false,
}: SourceMeterProps) {
  const pct = (score / 5) * 100;
  const barColor = METER_COLORS[score] || METER_COLORS[1];
  const height = compact ? "h-1.5" : "h-2.5";
  const width = compact ? "w-12" : "w-16";
  const isMax = score >= 5;

  const count = sourceCount ?? score;
  const label =
    count === 1 ? "1 source" : count > 5 ? `${count} sources` : `${count} sources`;

  return (
    <div className={`flex items-center gap-1.5 ${isMax ? "drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]" : ""}`}>
      <div className={`${width} ${height} rounded-full bg-black/30 overflow-hidden ${isMax ? "ring-2 ring-red-400/70" : ""}`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-[11px] font-semibold whitespace-nowrap ${isMax ? "text-red-300" : "text-white"}`}>
          {label}
        </span>
      )}
    </div>
  );
}
