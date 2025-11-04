import { Eye, MoreVertical, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';

const MobileTable = ({ data, activeTab, onViewDetails, onAction, selectedIds, onSelectItem }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const renderCard = (item) => {
    let title, subtitle, status, date;

    if (activeTab === 'users') {
      title = `${item.fullname?.firstname} ${item.fullname?.lastname}`;
      subtitle = item.email;
      status = item.isActive ? 'Active' : 'Inactive';
      date = new Date(item.createdAt).toLocaleDateString();
    } else if (activeTab === 'bookings') {
      title = item.hotelBooking?.hotelName || 'Booking';
      subtitle = `Ref: ${item.bookingReference}`;
      status = item.status;
      date = new Date(item.createdAt).toLocaleDateString();
    } else if (activeTab === 'hotels') {
      title = item.name;
      subtitle = item.location?.city;
      status = item.status;
      date = new Date(item.createdAt).toLocaleDateString();
    } else if (activeTab === 'payments') {
      title = `€${item.amount?.toFixed(2)}`;
      subtitle = item.paymentMethod;
      status = item.status;
      date = new Date(item.createdAt).toLocaleDateString();
    } else if (activeTab === 'support') {
      title = item.subject || 'Ticket';
      subtitle = item.user?.email;
      status = item.status;
      date = new Date(item.createdAt).toLocaleDateString();
    }

    return (
      <div key={item._id} className="bg-white rounded-lg shadow p-4 mb-3">
        <div className="flex items-start gap-3 mb-2">
          <button
            onClick={() => onSelectItem(item._id)}
            className="mt-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {selectedIds?.includes(item._id) ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
              <button
                onClick={() => setOpenMenu(openMenu === item._id ? null : item._id)}
                className="p-2 hover:bg-gray-100 rounded min-w-[44px] min-h-[44px]"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'confirmed' || status === 'Active' || status === 'active' ? 'bg-green-100 text-green-800' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        {openMenu === item._id && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            <button
              onClick={() => {
                onViewDetails(item, activeTab);
                setOpenMenu(null);
              }}
              className="flex-1 min-w-[120px] px-3 py-2 bg-blue-600 text-white rounded text-sm min-h-[44px]"
            >
              <Eye className="w-4 h-4 inline mr-1" />
              View
            </button>
            {activeTab === 'bookings' && status === 'confirmed' && (
              <>
                <button
                  onClick={() => {
                    onAction(item._id, 'voucher');
                    setOpenMenu(null);
                  }}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-purple-600 text-white rounded text-sm min-h-[44px]"
                >
                  Voucher
                </button>
                <button
                  onClick={() => {
                    onAction(item._id, 'cancel');
                    setOpenMenu(null);
                  }}
                  className="flex-1 min-w-[120px] px-3 py-2 bg-red-600 text-white rounded text-sm min-h-[44px]"
                >
                  Cancel
                </button>
              </>
            )}
            {activeTab === 'payments' && (item.paymentMethod === 'pay-on-site' || item.paymentMethod === 'pay_on_site') && status === 'pending' && (
              <button
                onClick={() => {
                  onAction(item._id, 'markPaid');
                  setOpenMenu(null);
                }}
                className="flex-1 min-w-[120px] px-3 py-2 bg-green-600 text-white rounded text-sm min-h-[44px]"
              >
                Mark Paid
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:hidden">
      {data.map(renderCard)}
    </div>
  );
};

export default MobileTable;
