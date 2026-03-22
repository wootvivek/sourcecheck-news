import { getOpinionsFromKV, getOpinionsGeneratedAt } from "@/lib/kvCache";
import OpinionArticle from "@/components/OpinionArticle";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Opinion — SourceCheck.News",
  description: "AI-generated analysis of today's top stories from multiple perspectives.",
};

export default async function AiOpinionPage() {
  const [opinions, generatedAt] = await Promise.all([
    getOpinionsFromKV(),
    getOpinionsGeneratedAt(),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-500"
          >
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M20 10l.7 2.1L23 13l-2.3.9L20 16l-.7-2.1L17 13l2.3-.9L20 10z" />
            <path d="M4 16l.7 2.1L7 19l-2.3.9L4 22l-.7-2.1L1 19l2.3-.9L4 16z" />
          </svg>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            AI Opinion
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          AI-generated analysis of today&apos;s most impactful stories, examining how different sources frame each narrative.
        </p>
      </div>

      {/* AI Disclaimer */}
      <div className="mb-6 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50">
        <p className="text-xs text-purple-700 dark:text-purple-300 text-center">
          These analyses are AI-generated using GPT-4o. They aim to present multiple perspectives but may contain errors or biases. Always check the original sources.
        </p>
      </div>

      {/* Opinion articles */}
      {opinions && opinions.length > 0 ? (
        <div className="space-y-6">
          {opinions.map((opinion) => (
            <OpinionArticle key={opinion.id} opinion={opinion} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Coming soon
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            AI opinion pieces are generated every few hours. Check back soon for in-depth analysis of today&apos;s top stories.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          &larr; Back to news
        </Link>
      </div>

      {generatedAt && (
        <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-gray-600">
          Analysis generated:{" "}
          {new Date(generatedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
          })}
        </p>
      )}
    </div>
  );
}
