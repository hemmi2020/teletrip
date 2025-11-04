import React, { useState } from 'react';
import { Columns, Check } from 'lucide-react';

const ColumnToggle = ({ columns, visibleColumns, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleColumn = (columnId) => {
    const newVisible = visibleColumns.includes(columnId)
      ? visibleColumns.filter(id => id !== columnId)
      : [...visibleColumns, columnId];
    onChange(newVisible);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <Columns size={16} />
        Columns
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-2 space-y-1">
              {columns.map(col => (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <div className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">
                    {visibleColumns.includes(col.id) && <Check size={14} className="text-blue-600" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.id)}
                    onChange={() => toggleColumn(col.id)}
                    className="hidden"
                  />
                  <span className="text-sm dark:text-gray-200">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnToggle;
