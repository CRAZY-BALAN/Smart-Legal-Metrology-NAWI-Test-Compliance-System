/**
 * Reusable Skeleton Loaders for Data-Heavy Views
 * Ministry of Consumer Affairs, Food & Public Distribution | Legal Metrology
 */

import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
      <div className="h-10 bg-[#F6F7F7] border-b border-gray-200 px-4 flex items-center space-x-4">
        <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
        <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
        <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
        <div className="h-4 w-1/4 skeleton-shimmer rounded"></div>
      </div>
      <div className="divide-y divide-gray-100 p-2">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="py-3 px-4 flex items-center space-x-4">
            <div className="h-4 w-1/5 skeleton-shimmer rounded"></div>
            <div className="h-4 w-2/5 skeleton-shimmer rounded"></div>
            <div className="h-4 w-1/5 skeleton-shimmer rounded"></div>
            <div className="h-4 w-1/5 skeleton-shimmer rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-3">
          <div className="h-5 w-3/4 skeleton-shimmer rounded"></div>
          <div className="h-3 w-1/2 skeleton-shimmer rounded"></div>
          <div className="h-2 w-full skeleton-shimmer rounded my-4"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 w-1/3 skeleton-shimmer rounded"></div>
            <div className="h-6 w-1/4 skeleton-shimmer rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs space-y-2">
          <div className="h-3 w-1/2 skeleton-shimmer rounded"></div>
          <div className="h-8 w-1/3 skeleton-shimmer rounded"></div>
          <div className="h-2.5 w-2/3 skeleton-shimmer rounded"></div>
        </div>
      ))}
    </div>
  );
};
