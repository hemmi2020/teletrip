import React from 'react';
import { Eye, Check, Trash2, Download, XCircle, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';

const CardView = ({ data, activeTab, onViewDetails, onAction, selectedIds, onSelectItem }) => {
  const renderCard = (item) => {
    if (activeTab === 'users') {
      return (
        <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(item._id)}
                onChange={() => onSelectItem(item._id)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-semibold">
                {item.fullname?.firstname?.charAt(0) || 'U'}
              </div>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {item.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {item.fullname?.firstname} {item.fullname?.lastname}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <Mail size={14} />
              {item.email}
            </div>
            {item.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {item.phone}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onViewDetails(item, activeTab)} className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 px-3 py-1 rounded text-sm">
              View
            </button>
          </div>
        </div>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              onChange={() => onSelectItem(item._id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className={`px-2 py-1 text-xs rounded-full ${
              item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {item.status}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {item.hotelBooking?.hotelName || 'Booking'}
          </h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              {item.hotelBooking?.hotelAddress?.city || 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={14} />
              PKR {item.totalAmount}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onViewDetails(item, activeTab)} className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 px-3 py-1 rounded text-sm">
              View
            </button>
            {item.status === 'confirmed' && (
              <button onClick={() => onAction(item._id, 'voucher')} className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 px-3 py-1 rounded text-sm">
                <Download size={14} />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'hotels') {
      return (
        <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              onChange={() => onSelectItem(item._id)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {item.status || 'Active'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.name}</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              {item.location?.city || 'N/A'}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onViewDetails(item, activeTab)} className="flex-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 px-3 py-1 rounded text-sm">
              View
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(renderCard)}
    </div>
  );
};

export default CardView;
