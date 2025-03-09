import React from "react";

/**
 * A skeleton loading component for response cards
 *
 * Displays a placeholder with animated loading effects while content is being
 * fetched
 */
const ResponseSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
      {/* Query skeleton */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-3/4 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </header>

      {/* Model name skeleton */}
      <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin">
        <div className="space-y-3">
          {/* Paragraph skeletons */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
          {/* Heading skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mt-6"></div>
          {/* More paragraph skeletons */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

export default ResponseSkeleton;
