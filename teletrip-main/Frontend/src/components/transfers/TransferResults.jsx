import { useState } from 'react';
import { Users, Clock, Filter, Eye } from 'lucide-react';
import TransferDetailsModal from './TransferDetailsModal';

const TransferResults = ({ results, onSelect, loading }) => {
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 10000, vehicleType: 'all' });
  const [sortBy, setSortBy] = useState('price');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const itemsPerPage = 9;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚐</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No transfers found</h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    );
  }

  const filteredResults = results
    .filter(t => t.price?.amount >= filters.minPrice && t.price?.amount <= filters.maxPrice)
    .filter(t => filters.vehicleType === 'all' || t.category?.toLowerCase().includes(filters.vehicleType))
    .sort((a, b) => {
      if (sortBy === 'price') return (a.price?.amount || 0) - (b.price?.amount || 0);
      if (sortBy === 'duration') return (a.duration || 0) - (b.duration || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Filter size={20} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="price">Price: Low to High</option>
            <option value="duration">Duration</option>
          </select>
          <select
            value={filters.vehicleType}
            onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Vehicles</option>
            <option value="private">Private</option>
            <option value="shared">Shared</option>
            <option value="shuttle">Shuttle</option>
          </select>
        </div>
        <p className="text-gray-600">{filteredResults.length} transfers found</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedResults.map((transfer, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow hover:shadow-lg transition border">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
              {transfer.images?.[0] ? (
                <img src={transfer.images[0]} alt={transfer.vehicle} className="w-full h-full object-cover rounded-t-lg" />
              ) : (
                <span className="text-6xl">🚐</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{transfer.vehicle || 'Transfer Vehicle'}</h3>
              <p className="text-sm text-gray-600 mb-3">{transfer.category}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>Up to {transfer.capacity} passengers</span>
                </div>
                {transfer.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>{transfer.duration}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {transfer.price?.currency} {transfer.price?.amount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTransfer(transfer)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Details
                  </button>
                  <button
                    onClick={() => onSelect(transfer)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onBook={(transfer) => {
            setSelectedTransfer(null);
            onSelect(transfer);
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransferResults;
