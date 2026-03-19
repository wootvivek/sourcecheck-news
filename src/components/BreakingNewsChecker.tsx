"use client";

import { useEffect, useRef } from "react";
import { Article } from "@/lib/types";
import { useNotifications } from "@/hooks/useNotifications";

interface Props {
  articles: Article[];
}

/**
 * Invisible component that checks for breaking news (5+ sources)
 * and sends PWA notifications if user has opted in.
 */
export default function BreakingNewsChecker({ articles }: Props) {
  const { notifyBreaking } = useNotifications();
  const checkedRef = useRef(new Set<string>());

  useEffect(() => {
    for (const article of articles) {
      if (article.echoScore >= 5 && !checkedRef.current.has(article.id)) {
        checkedRef.current.add(article.id);
        notifyBreaking(article.title, article.echoScore, article.link);
      }
    }
  }, [articles, notifyBreaking]);

  return null;
}
