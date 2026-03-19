"use client";

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "📡 Scanning hundreds of news sources…",
  "🌍 Reading headlines from around the globe…",
  "⚖️ Comparing stories across the spectrum…",
  "🐝 Fact-checking with the hive mind…",
  "🤖 Teaching robots to read the news…",
  "🐑 Herding news articles into clusters…",
  "🤝 Asking left and right to play nice…",
  "🔄 Untangling the 24-hour news cycle…",
  "☕ Cross-referencing like a caffeinated librarian…",
  "📶 Separating signal from noise…",
  "✅ Checking what 196 sources agree on…",
  "🧠 Making sense of it all…",
  "⚡ Aggregating with extreme prejudice (against bad takes)…",
  "🎙️ Interviewing electrons for the latest scoop…",
  "👀 Giving every headline the side-eye…",
  "🔢 Counting sources so you don't have to…",
  "🕵️ Making sure nobody's making stuff up…",
  "🔍 Trust but verify… mostly verify…",
  "🐕 Paws deep in data right now…",
  "☔ If one source says it's raining, we check outside…",
];

// SVG dog with binoculars — looking in different directions
function ScoutDog({ direction }: { direction: number }) {
  // direction: 0=left, 1=up-left, 2=center, 3=up-right, 4=right
  const binocX = [-8, -5, 0, 5, 8][direction];
  const binocY = [0, -3, -5, -3, 0][direction];
  const earWiggle = direction % 2 === 0 ? -3 : 3;
  const tailWag = direction % 2 === 0 ? 12 : -12;

  return (
    <svg width="180" height="180" viewBox="0 0 120 120" fill="none" className="select-none">
      {/* Tail */}
      <path
        d={`M 35 75 Q ${25 + tailWag} ${50 + Math.abs(tailWag) / 2} ${30 + tailWag} 45`}
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        className="text-amber-400 dark:text-amber-300"
        style={{ transition: "d 0.3s ease" }}
      />

      {/* Body */}
      <ellipse cx="55" cy="80" rx="22" ry="16" className="fill-amber-300 dark:fill-amber-400" />

      {/* Back legs */}
      <rect x="38" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />
      <rect x="58" y="88" width="7" height="16" rx="3.5" className="fill-amber-300 dark:fill-amber-400" />

      {/* Front legs / arms holding binoculars */}
      <rect x="68" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400"
        transform={`rotate(${-15 + binocX * 0.5} 71 81)`}
      />
      <rect x="78" y="72" width="6" height="18" rx="3" className="fill-amber-300 dark:fill-amber-400"
        transform={`rotate(${15 + binocX * 0.5} 81 81)`}
      />

      {/* Head */}
      <circle cx="75" cy="58" r="18" className="fill-amber-300 dark:fill-amber-400" />

      {/* Ears */}
      <ellipse cx="60" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500"
        transform={`rotate(${-20 + earWiggle} 60 44)`}
      />
      <ellipse cx="90" cy="44" rx="6" ry="10" className="fill-amber-400 dark:fill-amber-500"
        transform={`rotate(${20 + earWiggle} 90 44)`}
      />

      {/* Inner ears */}
      <ellipse cx="60" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300"
        transform={`rotate(${-20 + earWiggle} 60 44)`}
      />
      <ellipse cx="90" cy="44" rx="3" ry="6" className="fill-amber-200 dark:fill-amber-300"
        transform={`rotate(${20 + earWiggle} 90 44)`}
      />

      {/* Snout */}
      <ellipse cx="75" cy="64" rx="10" ry="7" className="fill-amber-200 dark:fill-amber-300" />
      {/* Nose */}
      <ellipse cx="75" cy="61" rx="4" ry="3" className="fill-gray-800 dark:fill-gray-900" />
      {/* Mouth */}
      <path d="M 72 65 Q 75 68 78 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
        className="text-gray-700 dark:text-gray-800"
      />

      {/* Binoculars - positioned based on direction */}
      <g transform={`translate(${binocX} ${binocY})`} style={{ transition: "transform 0.4s ease" }}>
        {/* Left barrel */}
        <rect x="64" y="50" width="10" height="14" rx="5" className="fill-gray-600 dark:fill-gray-500" />
        {/* Right barrel */}
        <rect x="78" y="50" width="10" height="14" rx="5" className="fill-gray-600 dark:fill-gray-500" />
        {/* Bridge */}
        <rect x="73" y="54" width="6" height="5" rx="2" className="fill-gray-500 dark:fill-gray-400" />
        {/* Left lens */}
        <circle cx="69" cy="51" r="5" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
        <circle cx="69" cy="51" r="3" className="fill-sky-100 dark:fill-sky-200" opacity="0.5" />
        {/* Right lens */}
        <circle cx="83" cy="51" r="5" className="fill-sky-300 dark:fill-sky-400" opacity="0.8" />
        <circle cx="83" cy="51" r="3" className="fill-sky-100 dark:fill-sky-200" opacity="0.5" />
        {/* Lens shine */}
        <circle cx="67" cy="49" r="1.5" className="fill-white" opacity="0.7" />
        <circle cx="81" cy="49" r="1.5" className="fill-white" opacity="0.7" />
      </g>

      {/* Belly spot */}
      <ellipse cx="55" cy="82" rx="10" ry="8" className="fill-amber-200 dark:fill-amber-300" opacity="0.5" />
    </svg>
  );
}

export default function LoadingScreen() {
  const [messageIdx, setMessageIdx] = useState(0);
  const [direction, setDirection] = useState(2);
  // Cycle messages every 2.5s
  useEffect(() => {
    const startIdx = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setMessageIdx(startIdx);

    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Animate dog looking around
  useEffect(() => {
    const sequence = [2, 4, 3, 2, 0, 1, 2, 3, 4, 2, 1, 0];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % sequence.length;
      setDirection(sequence[i]);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Animated dog */}
      <div className="mb-4 animate-bounce-slow">
        <ScoutDog direction={direction} />
      </div>

      {/* Fun rotating message */}
      <p
        key={messageIdx}
        className="text-sm text-gray-500 dark:text-gray-400 text-center animate-fade-in max-w-xs"
      >
        {LOADING_MESSAGES[messageIdx]}
      </p>
    </div>
  );
}
