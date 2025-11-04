import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const InfiniteScrollTable = ({ data, hasMore, onLoadMore, loading, renderRow, columns }) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th key={col.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
      
      <div ref={observerTarget} className="h-10 flex items-center justify-center">
        {loading && <Loader2 className="w-6 h-6 animate-spin text-blue-600" />}
      </div>
    </div>
  );
};

export default InfiniteScrollTable;
