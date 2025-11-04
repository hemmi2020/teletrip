import React, { useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';

const PricingCalendar = ({ hotelId, onUpdatePricing, showToast }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [pricing, setPricing] = useState({});
  const [editPrice, setEditPrice] = useState('');

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const handlePriceUpdate = (date) => {
    if (editPrice) {
      const dateKey = date.toISOString().split('T')[0];
      setPricing({ ...pricing, [dateKey]: parseFloat(editPrice) });
      onUpdatePricing?.({ hotelId, date: dateKey, price: parseFloat(editPrice) });
      showToast?.('Price updated', 'success');
      setEditPrice('');
    }
  };

  const days = getDaysInMonth(selectedDate);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calendar size={20} />
        Pricing Calendar
      </h3>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
          className="px-3 py-1 border rounded"
        >
          Previous
        </button>
        <div className="flex-1 text-center font-medium">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">{day}</div>
        ))}
        {days.map((date, idx) => {
          const dateKey = date.toISOString().split('T')[0];
          const price = pricing[dateKey];
          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedDate(date);
                setEditPrice(price || '');
              }}
              className={`p-2 border rounded text-center cursor-pointer hover:bg-blue-50 ${
                price ? 'bg-green-50 border-green-300' : ''
              }`}
            >
              <div className="text-sm">{date.getDate()}</div>
              {price && <div className="text-xs text-green-600">${price}</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="number"
          value={editPrice}
          onChange={(e) => setEditPrice(e.target.value)}
          placeholder="Enter price"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={() => handlePriceUpdate(selectedDate)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Set Price
        </button>
      </div>
    </div>
  );
};

export default PricingCalendar;
