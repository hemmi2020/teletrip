import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HotelPerformanceMetrics = ({ hotelId, showToast }) => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, [hotelId]);

  const loadMetrics = async () => {
    // Mock data - replace with API call
    setMetrics({
      occupancyRate: 75,
      totalBookings: 245,
      revenue: 125000,
      avgRating: 4.5,
      reviewCount: 89,
      chartData: [
        { month: 'Jan', bookings: 45, revenue: 22500 },
        { month: 'Feb', bookings: 52, revenue: 26000 },
        { month: 'Mar', bookings: 48, revenue: 24000 }
      ]
    });
  };

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Hotel Performance Metrics</h3>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">Occupancy Rate</div>
          <div className="text-2xl font-bold">{metrics.occupancyRate}%</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Bookings</div>
          <div className="text-2xl font-bold">{metrics.totalBookings}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">Revenue</div>
          <div className="text-2xl font-bold">${(metrics.revenue / 1000).toFixed(0)}K</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900 rounded p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300">Avg Rating</div>
          <div className="text-2xl font-bold">{metrics.avgRating} ⭐</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={metrics.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="bookings" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HotelPerformanceMetrics;
