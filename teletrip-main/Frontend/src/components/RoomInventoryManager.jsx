import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save } from 'lucide-react';

const RoomInventoryManager = ({ hotelId, rooms = [], onUpdate, showToast }) => {
  const [editingRoom, setEditingRoom] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    count: 0,
    price: 0,
    capacity: 2,
    amenities: []
  });

  const handleSave = () => {
    if (editingRoom) {
      onUpdate?.({ ...editingRoom, ...formData });
      setEditingRoom(null);
    } else {
      onUpdate?.({ ...formData, hotelId });
      setShowAddForm(false);
    }
    setFormData({ type: '', count: 0, price: 0, capacity: 2, amenities: [] });
    showToast?.('Room inventory updated', 'success');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Room Inventory</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus size={16} />
          Add Room
        </button>
      </div>

      <div className="space-y-3">
        {rooms.map((room, idx) => (
          <div key={idx} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{room.type}</div>
              <div className="text-sm text-gray-600">
                {room.count} rooms • ${room.price}/night • Capacity: {room.capacity}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingRoom(room); setFormData(room); }}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit size={16} />
              </button>
              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(showAddForm || editingRoom) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">{editingRoom ? 'Edit' : 'Add'} Room</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Room Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Number of Rooms"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Price per Night"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Capacity"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Save size={16} className="inline mr-1" />
                Save
              </button>
              <button
                onClick={() => { setShowAddForm(false); setEditingRoom(null); }}
                className="flex-1 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInventoryManager;
