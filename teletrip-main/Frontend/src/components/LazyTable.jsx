import { useEffect, useRef, useState } from 'react';
import { TableSkeleton } from './SkeletonLoader';

const LazyTable = ({ data, renderRow, hasMore, onLoadMore, loading }) => {
  const observerRef = useRef();
  const [visibleData, setVisibleData] = useState([]);

  useEffect(() => {
    setVisibleData(data.slice(0, 20));
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div>
      {visibleData.map((item, index) => renderRow(item, index))}
      {loading && <TableSkeleton rows={3} />}
      <div ref={observerRef} className="h-10" />
    </div>
  );
};

export default LazyTable;
