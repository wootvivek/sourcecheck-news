// Political bias ratings for news sources
// Based on publicly available data from AllSides and Media Bias/Fact Check
// Scale: -2 (far left), -1 (left-center), 0 (center), 1 (right-center), 2 (far right)

export type BiasRating = -2 | -1 | 0 | 1 | 2;

export interface BiasInfo {
  rating: BiasRating;
  label: string;
  color: string;
  bgColor: string;
}

const BIAS_LABELS: Record<BiasRating, BiasInfo> = {
  [-2]: { rating: -2, label: "Left", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-500" },
  [-1]: { rating: -1, label: "Left-Center", color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-400" },
  [0]:  { rating: 0,  label: "Center", color: "text-gray-600 dark:text-gray-400", bgColor: "bg-gray-400" },
  [1]:  { rating: 1,  label: "Right-Center", color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-400" },
  [2]:  { rating: 2,  label: "Right", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500" },
};

// Source name → bias rating mapping
export const SOURCE_BIAS: Record<string, BiasRating> = {
  // World
  "BBC News": 0,
  "Reuters": 0,
  "New York Times": -1,
  "Washington Post": -1,
  "Al Jazeera": -1,
  "NPR": -1,
  "The Guardian": -1,
  "ABC News": 0,
  "CNN": -1,
  "Sky News": 0,
  "CBS News": 0,
  "NBC News": -1,
  "PBS NewsHour": 0,
  "France 24": 0,
  "NHK World": 0,
  "DW News": 0,
  "Times of India": 0,
  "ABC Australia": 0,
  "Fox News": 1,
  "The Independent": -1,
  "The Telegraph": 1,
  "TIME": -1,
  "Voice of America": 0,
  "Global News CA": 0,
  "South China Morning Post": 0,
  "LA Times": -1,
  "NDTV": 0,
  "The Hindu": 0,
  "Irish Times": 0,
  "Jerusalem Post": 1,

  // Politics
  "Politico": -1,
  "The Hill": 0,
  "NYT Politics": -1,
  "WaPo Politics": -1,
  "CNN Politics": -1,
  "Fox Politics": 1,
  "NPR Politics": -1,
  "BBC Politics": 0,
  "RealClearPolitics": 1,
  "Daily Caller": 2,
  "National Review": 2,
  "The Intercept": -2,
  "Mother Jones": -2,
  "Daily Wire": 2,
  "Salon": -2,
  "Breitbart": 2,
  "Common Dreams": -2,
  "Guardian US": -1,
  "Axios": 0,
  "Talking Points Memo": -2,
  "CBS Politics": 0,
  "ABC Politics": 0,
  "USA Today Politics": 0,
  "FiveThirtyEight": 0,

  // Tech
  "TechCrunch": -1,
  "Ars Technica": -1,
  "The Verge": -1,
  "Wired": -1,
  "TechRadar": 0,
  "Engadget": 0,
  "ZDNet": 0,
  "CNET": 0,
  "VentureBeat": 0,
  "The Next Web": 0,
  "Tom's Hardware": 0,
  "9to5Mac": 0,
  "MacRumors": 0,
  "9to5Google": 0,
  "Android Central": 0,
  "TechSpot": 0,
  "Techmeme": 0,
  "Digital Trends": 0,
  "The Register": 0,
  "Gizmodo": -1,

  // Business
  "CNBC": 0,
  "NYT Business": -1,
  "Bloomberg": 0,
  "Financial Times": 0,
  "MarketWatch": 0,
  "The Economist": 0,
  "Reuters Business": 0,
  "Wall Street Journal": 1,
  "Fortune": 0,
  "Forbes": 1,
  "Inc.": 0,
  "Quartz": -1,
  "Entrepreneur": 0,
  "Harvard Business Review": 0,
  "Barron's": 1,
  "InvestorPlace": 0,
  "Business Insider": -1,
  "Motley Fool": 0,
  "Yahoo Finance": 0,

  // Health
  "NYT Health": -1,
  "WaPo Health": -1,
  "STAT News": 0,
  "BBC Health": 0,
  "Guardian Health": -1,
  "NPR Health": -1,
  "CNN Health": -1,
  "Medical News Today": 0,
  "WebMD": 0,
  "Healthline": 0,
  "WHO News": 0,
  "NIH News": 0,
  "The Lancet": 0,
  "BMJ": 0,
  "KFF Health News": 0,
  "Fierce Healthcare": 0,
  "Everyday Health": 0,
  "Live Science Health": 0,
  "Fox Health": 1,
  "SciAm Health": 0,

  // Sports
  "ESPN": 0,
  "BBC Sport": 0,
  "Guardian Sport": -1,
  "NYT Sports": -1,
  "Yahoo Sports": 0,
  "CBS Sports": 0,
  "Sky Sports": 0,
  "Sports Illustrated": 0,
  "The Athletic": 0,
  "Fox Sports": 1,
  "Bleacher Report": 0,
  "NBC Sports": 0,
  "SB Nation": 0,
  "Deadspin": -1,
  "Sporting News": 0,
  "USA Today Sports": 0,

  // Science
  "NASA": 0,
  "Science Daily": 0,
  "New Scientist": 0,
  "Nature": 0,
  "BBC Science": 0,
  "NYT Science": -1,
  "Science Magazine": 0,
  "Phys.org": 0,
  "Live Science": 0,
  "Space.com": 0,
  "Scientific American": 0,
  "Discover Magazine": 0,
  "IFLScience": 0,
  "Smithsonian": 0,
  "Guardian Science": -1,
  "Popular Science": 0,
  "Quanta Magazine": 0,
  "Atlas Obscura": 0,

  // Entertainment
  "Variety": 0,
  "Hollywood Reporter": 0,
  "Deadline": 0,
  "BBC Entertainment": 0,
  "Guardian Culture": -1,
  "Entertainment Weekly": 0,
  "Rolling Stone": -1,
  "Pitchfork": -1,
  "Vulture": -1,
  "IndieWire": -1,
  "Collider": 0,
  "Screen Rant": 0,
  "The A.V. Club": -1,
  "NME": 0,
  "Consequence of Sound": -1,
  "Stereogum": 0,
  "TheWrap": 0,
  "Complex": 0,

  // Opinion
  "NYT Opinion": -1,
  "WaPo Opinions": -1,
  "Guardian Opinion": -1,
  "WSJ Opinion": 1,
  "The New Yorker": -1,
  "Vox": -1,
  "The Atlantic": -1,
  "New York Magazine": -1,
  "The Spectator": 2,
  "The Nation": -2,
  "Jacobin": -2,
  "American Conservative": 2,
  "Reason": 1,
  "Current Affairs": -2,
  "Slate": -1,
  "Newsweek": 0,
  "Daily Beast": -1,
  "UnHerd": 1,
  "American Prospect": -2,
  "Quillette": 1,

  // Local
  "NYT Metro": -1,
  "Gothamist": -1,
  "Patch NYC": 0,
  "LA Times Local": -1,
  "LAist": -1,
  "Patch LA": 0,
  "Chicago Tribune": 0,
  "Block Club Chicago": 0,
  "Houston Chronicle": 0,
  "Arizona Republic": 0,
  "Philadelphia Inquirer": -1,
  "San Antonio Express-News": 0,
  "San Diego Union-Tribune": 0,
  "Dallas Morning News": 0,
  "SF Chronicle": -1,
  "SFGate": -1,
  "Austin American-Statesman": 0,
  "Seattle Times": -1,
  "Denver Post": 0,
  "Atlanta Journal-Constitution": 0,
  "Miami Herald": 0,
  "Boston Globe": -1,
  "WaPo Local": -1,
  "Detroit Free Press": -1,
  "Star Tribune": 0,
  "The Oregonian": 0,

  // Reddit
  "r/worldnews": 0,
  "r/news": 0,
  "r/politics": -1,
  "r/technology": 0,
  "r/business": 0,
  "r/economics": 0,
  "r/health": 0,
  "r/sports": 0,
  "r/science": 0,
  "r/space": 0,
  "r/entertainment": 0,
  "r/movies": 0,
};

export function getSourceBias(sourceName: string): BiasInfo {
  const rating = SOURCE_BIAS[sourceName] ?? 0;
  return BIAS_LABELS[rating];
}

export function getBiasLabel(rating: BiasRating): BiasInfo {
  return BIAS_LABELS[rating];
}

// For a cluster of sources, compute the spectrum coverage
export interface SpectrumData {
  positions: { source: string; rating: BiasRating; info: BiasInfo }[];
  spread: number; // 0-4, how wide the political spread is
  label: string;
}

export function computeSpectrum(sources: string[]): SpectrumData {
  const positions = sources.map((source) => {
    const info = getSourceBias(source);
    return { source, rating: info.rating, info };
  });

  if (positions.length <= 1) {
    return { positions, spread: 0, label: "Single source" };
  }

  const ratings = positions.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const spread = max - min;

  let label: string;
  if (spread >= 3) label = "Full spectrum";
  else if (spread >= 2) label = "Wide coverage";
  else if (spread >= 1) label = "Moderate range";
  else label = "Similar perspective";

  return { positions, spread, label };
}

export { BIAS_LABELS };
