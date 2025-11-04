import { useMemo } from 'react';

export const useMemoizedData = (data, filters) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = [...data];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(item => 
        filters.status.includes(item.status)
      );
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];
        return filters.sortOrder === 'asc' ? 
          (aVal > bVal ? 1 : -1) : 
          (aVal < bVal ? 1 : -1);
      });
    }

    return filtered;
  }, [data, filters]);
};
