import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, CreditCard, Mail, User, Home } from 'lucide-react';

const BookingTimelineView = ({ bookingId }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [bookingId]);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/bookings/${bookingId}/timeline`);
      const data = await response.json();
      setTimeline(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconType) => {
    const iconMap = {
      calendar: Calendar,
      'credit-card': CreditCard,
      mail: Mail,
      user: User,
      check: CheckCircle,
      home: Home,
      clock: Clock
    };
    return iconMap[iconType] || Clock;
  };

  const getIconColor = (type) => {
    const colorMap = {
      created: 'bg-blue-100 text-blue-600',
      payment: 'bg-green-100 text-green-600',
      email: 'bg-purple-100 text-purple-600',
      update: 'bg-yellow-100 text-yellow-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
      checkin: 'bg-indigo-100 text-indigo-600',
      checkout: 'bg-gray-100 text-gray-600'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-600';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Clock className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-bold">Booking Timeline</h3>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading timeline...</p>
      ) : timeline.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No timeline events</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {timeline.map((event, index) => {
              const IconComponent = getIcon(event.icon);
              const { date, time } = formatTimestamp(event.timestamp);

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getIconColor(event.type)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{event.event}</h4>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{date}</p>
                          <p className="text-xs text-gray-500">{time}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{timeline.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {timeline.filter(e => e.type === 'payment').length}
            </p>
            <p className="text-sm text-gray-600">Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {timeline.filter(e => e.type === 'email').length}
            </p>
            <p className="text-sm text-gray-600">Emails Sent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {timeline.filter(e => e.type === 'update').length}
            </p>
            <p className="text-sm text-gray-600">Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTimelineView;
