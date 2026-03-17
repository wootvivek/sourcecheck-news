import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About – SourceCheck.News",
  description:
    "Why SourceCheck.News exists and how it measures news credibility.",
};

function AboutDog() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      className="select-none"
    >
      {/* Body */}
      <ellipse cx="55" cy="80" rx="22" ry="16" className="fill-amber-300 dark:fill-amber-400" />
      {/* Back legs */}
      <rect x="38" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />
      <rect x="58" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />
      {/* Front legs */}
      <rect x="68" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400" transform="rotate(-15 71 81)" />
      <rect x="78" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400" transform="rotate(15 81 81)" />
      {/* Head */}
      <circle cx="75" cy="58" r="18" className="fill-amber-300 dark:fill-amber-400" />
      {/* Ears */}
      <ellipse cx="60" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500" transform="rotate(-20 60 44)" />
      <ellipse cx="90" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500" transform="rotate(20 90 44)" />
      {/* Inner ears */}
      <ellipse cx="60" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300" transform="rotate(-20 60 44)" />
      <ellipse cx="90" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300" transform="rotate(20 90 44)" />
      {/* Snout */}
      <ellipse cx="75" cy="64" rx="10" ry="7" className="fill-amber-200 dark:fill-amber-300" />
      {/* Nose */}
      <ellipse cx="75" cy="61" rx="4" ry="3" className="fill-gray-800 dark:fill-gray-900" />
      {/* Mouth */}
      <path d="M 72 65 Q 75 68 78 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" className="text-gray-700 dark:text-gray-800" />
      {/* Binoculars */}
      <rect x="62" y="48" width="12" height="16" rx="6" className="fill-gray-600 dark:fill-gray-500" />
      <rect x="78" y="48" width="12" height="16" rx="6" className="fill-gray-600 dark:fill-gray-500" />
      <rect x="73" y="53" width="6" height="6" rx="2" className="fill-gray-500 dark:fill-gray-400" />
      <circle cx="68" cy="49" r="6" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
      <circle cx="84" cy="49" r="6" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
      <circle cx="66" cy="47" r="2" className="fill-white" opacity="0.7" />
      <circle cx="82" cy="47" r="2" className="fill-white" opacity="0.7" />
      {/* Belly spot */}
      <ellipse cx="55" cy="82" rx="10" ry="8" className="fill-amber-200 dark:fill-amber-300" opacity="0.5" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <AboutDog />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
          SourceCheck<span className="text-blue-600 dark:text-blue-400">.News</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          One source is a rumor. Multiple sources is news.
        </p>
      </div>

      <div className="space-y-6 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
        <p>
          SourceCheck aggregates 196+ news sources and scores every story from 1 to 5 based on how
          many independent newsrooms are covering it. No engagement algorithms, no personalized
          feeds — just a transparent metric so you can tell signal from noise at a glance.
        </p>

        <p>
          We also show the political bias spectrum of sources behind each story, and a{" "}
          <Link href="/quiet-corner" className="text-blue-600 dark:text-blue-400 hover:underline">
            Quiet Corner
          </Link>{" "}
          for stories only one outlet is reporting — sometimes noise, sometimes tomorrow&apos;s headlines.
        </p>

        <hr className="border-gray-200 dark:border-gray-700" />

        <p>
          Built by Vivek. Free, independent, no ads, no tracking.{" "}
          <a
            href="mailto:wootvivek@gmail.com"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            wootvivek@gmail.com
          </a>
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          &larr; Back to news
        </Link>
      </div>

      <p className="mt-8 text-center text-[11px] text-gray-300 dark:text-gray-700">
        v1.2
      </p>
    </div>
  );
}
