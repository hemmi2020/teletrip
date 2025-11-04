import React, { useState } from 'react';

const ResizableTable = ({ columns, data, onResize }) => {
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width || 150 }), {})
  );
  const [resizing, setResizing] = useState(null);

  const handleMouseDown = (columnId, e) => {
    setResizing({ columnId, startX: e.clientX, startWidth: columnWidths[columnId] });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);
    setColumnWidths(prev => ({ ...prev, [resizing.columnId]: newWidth }));
  };

  const handleMouseUp = () => {
    if (resizing) {
      onResize?.(columnWidths);
      setResizing(null);
    }
  };

  React.useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            {columns.map(col => (
              <th
                key={col.id}
                style={{ width: columnWidths[col.id] }}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider relative"
              >
                {col.label}
                <div
                  onMouseDown={(e) => handleMouseDown(col.id, e)}
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td
                  key={col.id}
                  style={{ width: columnWidths[col.id] }}
                  className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200"
                >
                  {col.render ? col.render(row) : row[col.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResizableTable;
