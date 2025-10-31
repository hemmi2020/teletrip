import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Users, Package, CreditCard } from 'lucide-react';

// Chart color palette
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Trend Chart
export const RevenueTrendChart = ({ data, period = 'daily' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Track revenue over time</p>
        </div>
        <DollarSign className="w-8 h-8 text-blue-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke={COLORS.primary} 
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue (PKR)"
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke={COLORS.success} 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Target (PKR)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Booking Status Pie Chart
export const BookingStatusChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Booking Status</h3>
          <p className="text-sm text-gray-500">Distribution by status</p>
        </div>
        <Package className="w-8 h-8 text-green-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
            />
            <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// User Growth Area Chart
export const UserGrowthChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
          <p className="text-sm text-gray-500">New user registrations</p>
        </div>
        <Users className="w-8 h-8 text-purple-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="users" 
            stroke={COLORS.purple} 
            fillOpacity={1} 
            fill="url(#colorUsers)"
            name="New Users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Payment Method Distribution Chart
export const PaymentMethodChart = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <p className="text-sm text-gray-500">Distribution by method</p>
        </div>
        <CreditCard className="w-8 h-8 text-orange-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="method" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={COLORS.warning} name="Transactions" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Booking Trends Chart (Daily/Weekly/Monthly)
export const BookingTrendsChart = ({ data, period }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Booking Trends</h3>
          <p className="text-sm text-gray-500 capitalize">{period} bookings overview</p>
        </div>
        <TrendingUp className="w-8 h-8 text-green-600" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="bookings" fill={COLORS.primary} name="Bookings" radius={[8, 8, 0, 0]} />
          <Bar dataKey="cancelled" fill={COLORS.danger} name="Cancelled" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Real-time Metrics Dashboard
export const RealTimeMetrics = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Today's Revenue</span>
          <DollarSign className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">PKR {metrics.todayRevenue?.toLocaleString() || 0}</p>
        <p className="text-xs opacity-75 mt-1">
          {metrics.revenueChange > 0 ? '+' : ''}{metrics.revenueChange}% vs yesterday
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Today's Bookings</span>
          <Package className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">{metrics.todayBookings || 0}</p>
        <p className="text-xs opacity-75 mt-1">
          {metrics.bookingChange > 0 ? '+' : ''}{metrics.bookingChange}% vs yesterday
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Active Users</span>
          <Users className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">{metrics.activeUsers || 0}</p>
        <p className="text-xs opacity-75 mt-1">Online now</p>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Pending Payments</span>
          <CreditCard className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold">{metrics.pendingPayments || 0}</p>
        <p className="text-xs opacity-75 mt-1">Awaiting confirmation</p>
      </div>
    </div>
  );
};

// Period Selector Component
export const PeriodSelector = ({ period, onChange }) => {
  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            period === p.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default {
  RevenueTrendChart,
  BookingStatusChart,
  UserGrowthChart,
  PaymentMethodChart,
  BookingTrendsChart,
  RealTimeMetrics,
  PeriodSelector
};
