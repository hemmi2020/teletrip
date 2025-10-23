import { X, Users, Luggage, Wifi, Clock, MapPin, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';

const TransferDetailsModal = ({ transfer, onClose, onBook }) => {
  if (!transfer) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{transfer.vehicle}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            {transfer.images?.[0] ? (
              <img src={transfer.images[0]} alt={transfer.vehicle} className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-8xl">🚐</span>
              </div>
            )}
          </div>

          {/* Vehicle Specs */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Users size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="font-semibold">{transfer.capacity} passengers</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Luggage size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Luggage</p>
                  <p className="font-semibold">{transfer.capacity} bags</p>
                </div>
              </div>
              {transfer.duration && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold">{transfer.duration}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin size={20} className="text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold">{transfer.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Included Services */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Included Services</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Meet & Greet</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Flight Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Free Cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm">Professional Driver</span>
              </div>
            </div>
          </div>

          {/* Pickup Instructions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Pickup Instructions</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Your driver will meet you at the arrivals hall with a sign displaying your name. 
                Please provide your flight details during booking for accurate pickup timing.
              </p>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Cancellation Policy</h3>
            <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Free cancellation up to 24 hours before pickup</p>
                <p>Cancel within 24 hours: 50% refund. No-show: No refund.</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Price Breakdown</h3>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-semibold">{transfer.price?.currency} {transfer.price?.amount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Taxes & Fees</span>
                <span className="font-semibold">Included</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-blue-600">
                  {transfer.price?.currency} {transfer.price?.amount}
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Terms & Conditions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Valid ID required at pickup</p>
              <p>• Maximum waiting time: 60 minutes after flight landing</p>
              <p>• Extra stops may incur additional charges</p>
              <p>• Child seats available upon request</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
            <button
              onClick={() => onBook(transfer)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default TransferDetailsModal;
