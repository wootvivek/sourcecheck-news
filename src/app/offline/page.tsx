export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="text-6xl mb-4">📡</div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        You&apos;re offline
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        SourceCheck.News needs an internet connection to fetch the latest stories.
        Please check your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
