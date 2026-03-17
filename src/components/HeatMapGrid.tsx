"use client";

import { useMemo } from "react";
import { Article } from "@/lib/types";
import HeatMapTile from "./HeatMapTile";

interface HeatMapGridProps {
  articles: Article[];
}

function getTier(echoScore: number): "hero" | "medium" | "small" {
  if (echoScore >= 4) return "hero";
  if (echoScore >= 2) return "medium";
  return "small";
}

function getSpans(tier: "hero" | "medium" | "small") {
  switch (tier) {
    case "hero":
      return { col: "col-span-12 sm:col-span-6", row: "sm:row-span-2" };
    case "medium":
      return { col: "col-span-6 sm:col-span-4", row: "" };
    case "small":
      return { col: "col-span-6 sm:col-span-3", row: "" };
  }
}

export default function HeatMapGrid({
  articles,
}: HeatMapGridProps) {
  // Sort hero-first for best CSS grid packing
  const sorted = useMemo(() => {
    const tierOrder = { hero: 0, medium: 1, small: 2 };
    return [...articles].sort((a, b) => {
      const ta = getTier(a.echoScore);
      const tb = getTier(b.echoScore);
      return tierOrder[ta] - tierOrder[tb];
    });
  }, [articles]);

  return (
    <div
      className="grid grid-cols-12 gap-3"
      style={{ gridAutoFlow: "dense" }}
    >
      {sorted.map((article) => {
        const tier = getTier(article.echoScore);
        const spans = getSpans(tier);
        return (
          <div
            key={article.id}
            className={`${spans.col} ${spans.row}`}
          >
            <HeatMapTile
              article={article}
              tier={tier}
            />
          </div>
        );
      })}
    </div>
  );
}
