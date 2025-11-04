import { useState } from 'react';

export const useOptimistic = (initialData) => {
  const [data, setData] = useState(initialData);
  const [optimisticData, setOptimisticData] = useState(initialData);

  const updateOptimistic = (updater, rollback = true) => {
    const newData = typeof updater === 'function' ? updater(optimisticData) : updater;
    setOptimisticData(newData);

    return {
      commit: () => setData(newData),
      rollback: () => rollback && setOptimisticData(data)
    };
  };

  return [optimisticData, updateOptimistic, setData];
};
