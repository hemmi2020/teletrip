import React from 'react';
import { Grid, List } from 'lucide-react';

const ViewToggle = ({ view, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={`p-2 rounded ${view === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
        title="Grid View"
      >
        <Grid size={18} className={view === 'grid' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'} />
      </button>
      <button
        onClick={() => onChange('list')}
        className={`p-2 rounded ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
        title="List View"
      >
        <List size={18} className={view === 'list' ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'} />
      </button>
    </div>
  );
};

export default ViewToggle;
