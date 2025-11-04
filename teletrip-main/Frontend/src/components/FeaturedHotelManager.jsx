import React, { useState, useEffect } from 'react';
import { Star, ArrowUp, ArrowDown, X } from 'lucide-react';

const FeaturedHotelManager = ({ showToast }) => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [availableHotels, setAvailableHotels] = useState([]);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    // Mock data - replace with API call
    setFeaturedHotels([
      { id: 1, name: 'Grand Hotel', city: 'New York', order: 1 },
      { id: 2, name: 'Beach Resort', city: 'Miami', order: 2 }
    ]);
    setAvailableHotels([
      { id: 3, name: 'Mountain Lodge', city: 'Denver' },
      { id: 4, name: 'City Inn', city: 'Chicago' }
    ]);
  };

  const handleAddFeatured = (hotel) => {
    setFeaturedHotels([...featuredHotels, { ...hotel, order: featuredHotels.length + 1 }]);
    setAvailableHotels(availableHotels.filter(h => h.id !== hotel.id));
    showToast?.('Hotel added to featured', 'success');
  };

  const handleRemoveFeatured = (hotelId) => {
    const hotel = featuredHotels.find(h => h.id === hotelId);
    setFeaturedHotels(featuredHotels.filter(h => h.id !== hotelId));
    setAvailableHotels([...availableHotels, hotel]);
    showToast?.('Hotel removed from featured', 'success');
  };

  const handleReorder = (hotelId, direction) => {
    const index = featuredHotels.findIndex(h => h.id === hotelId);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === featuredHotels.length - 1)) return;
    
    const newList = [...featuredHotels];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];
    setFeaturedHotels(newList.map((h, i) => ({ ...h, order: i + 1 })));
    showToast?.('Order updated', 'success');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Star size={20} className="text-yellow-500" />
        Featured Hotels Management
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Featured Hotels</h4>
          <div className="space-y-2">
            {featuredHotels.map((hotel) => (
              <div key={hotel.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{hotel.name}</div>
                  <div className="text-sm text-gray-600">{hotel.city}</div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleReorder(hotel.id, 'up')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleReorder(hotel.id, 'down')}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => handleRemoveFeatured(hotel.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">Available Hotels</h4>
          <div className="space-y-2">
            {availableHotels.map((hotel) => (
              <div key={hotel.id} className="border rounded p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{hotel.name}</div>
                  <div className="text-sm text-gray-600">{hotel.city}</div>
                </div>
                <button
                  onClick={() => handleAddFeatured(hotel)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHotelManager;
