import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Hotel, CreditCard, Package, MessageSquare, 
  Settings, TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  Filter, Download, RefreshCw, Eye, Edit, Trash2, Check, X,
  Bell, Star, MapPin, Phone, Mail, BarChart3, PieChart, Activity,
  FileText, Shield, Lock, LogOut, ChevronDown, Plus, AlertCircle,
  Clock, CheckCircle, XCircle, Loader2, ArrowUpRight, ArrowDownRight,
  Menu, XCircle as CloseIcon, Save, Camera, User, Globe, Zap
} from 'lucide-react';
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

// Axios instance with admin token
const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});

adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, trend, loading }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {loading ? (
          <div className="h-8 bg-gray-200 animate-pulse rounded w-24"></div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        )}
        {change && !loading && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ml-1 font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}%
            </span>
            <span className="text-xs text-gray-500 ml-2">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${trend === 'up' ? 'bg-green-50' : 'bg-blue-50'}`}>
        <Icon className={`w-8 h-8 ${trend === 'up' ? 'text-green-600' : 'text-blue-600'}`} />
      </div>
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
};

// Notification Toast
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${styles[type]} flex items-center space-x-3 animate-slide-in`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <XCircle className="w-5 h-5" />}
      {type === 'info' && <AlertCircle className="w-5 h-5" />}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-4">
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalHotels: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    userGrowth: 0,
    hotelGrowth: 0
  });
  const [data, setData] = useState({ docs: [], totalDocs: 0, totalPages: 1, page: 1 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Admin user info
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const response = await adminAPI.get('/api/admin/dashboard?period=30d');
        setStats(response.data.data || stats);
      } else if (activeTab === 'users') {
        const params = new URLSearchParams(filters).toString();
        const response = await adminAPI.get(`/api/admin/users?${params}`);
        setData(response.data.data || { docs: [], totalDocs: 0, totalPages: 1 });
      } else if (activeTab === 'bookings') {
        const params = new URLSearchParams(filters).toString();
        const response = await adminAPI.get(`/api/admin/bookings?${params}`);
        setData(response.data.data || { docs: [], totalDocs: 0, totalPages: 1 });
      } else if (activeTab === 'hotels') {
        const params = new URLSearchParams(filters).toString();
        const response = await adminAPI.get(`/api/admin/hotels?${params}`);
        setData(response.data.data || { docs: [], totalDocs: 0, totalPages: 1 });
      } else if (activeTab === 'payments') {
        const params = new URLSearchParams(filters).toString();
        const response = await adminAPI.get(`/api/admin/payments?${params}`);
        setData(response.data.data || { docs: [], totalDocs: 0, totalPages: 1 });
      } else if (activeTab === 'support') {
        const params = new URLSearchParams(filters).toString();
        const response = await adminAPI.get(`/api/admin/support/tickets?${params}`);
        setData(response.data.data || { docs: [], totalDocs: 0, totalPages: 1 });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast(error.response?.data?.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleExport = async () => {
    try {
      showToast('Exporting data...', 'info');
      const response = await adminAPI.get(`/api/admin/reports/${activeTab}/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Export successful!', 'success');
    } catch{
      showToast('Export failed', 'error');
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'activate' || action === 'deactivate') {
        await adminAPI.put(`/api/admin/users/${userId}/status`, {
          isActive: action === 'activate',
          reason: `Admin ${action}d user`
        });
        showToast(`User ${action}d successfully`, 'success');
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this user?')) {
          await adminAPI.delete(`/api/admin/users/${userId}`, {
            data: { reason: 'Admin deletion' }
          });
          showToast('User deleted successfully', 'success');
        }
      }
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleBookingAction = async (bookingId, status) => {
    try {
      await adminAPI.put(`/api/admin/bookings/${bookingId}/status`, {
        status,
        notes: `Status updated by admin`
      });
      showToast('Booking updated successfully', 'success');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Action failed', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Package },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TeliTrip Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {adminData.fullname?.firstname} {adminData.fullname?.lastname}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{adminData.role?.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {adminData.fullname?.firstname?.[0] || 'A'}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`PKR ${stats.totalRevenue?.toLocaleString() || 0}`}
                change={stats.revenueGrowth}
                trend="up"
                icon={DollarSign}
                loading={loading}
              />
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings?.toLocaleString() || 0}
                change={stats.bookingGrowth}
                trend="up"
                icon={Package}
                loading={loading}
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers?.toLocaleString() || 0}
                change={stats.userGrowth}
                trend="up"
                icon={Users}
                loading={loading}
              />
              <StatCard
                title="Total Hotels"
                value={stats.totalHotels?.toLocaleString() || 0}
                change={stats.hotelGrowth}
                trend="up"
                icon={Hotel}
                loading={loading}
              />
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Revenue Trend
                </h3>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                    <p className="text-gray-500">Chart integration coming soon</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
                  Booking Distribution
                </h3>
                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-indigo-300 mx-auto mb-2" />
                    <p className="text-gray-500">Chart integration coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={loadData}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                          <p className="mt-2 text-gray-500">Loading users...</p>
                        </td>
                      </tr>
                    ) : data.docs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      data.docs.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.fullname?.firstname?.[0] || 'U'}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">
                                  {user.fullname?.firstname} {user.fullname?.lastname}
                                </p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{user.phone || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, 'delete')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {(filters.page - 1) * filters.limit + 1} to {Math.min(filters.page * filters.limit, data.totalDocs)} of {data.totalDocs} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(data.totalPages, 5))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-lg ${
                              filters.page === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= data.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={loadData} className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button onClick={handleExport} className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                        </td>
                      </tr>
                    ) : data.docs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">No bookings found</td>
                      </tr>
                    ) : (
                      data.docs.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-blue-600">{booking.bookingReference}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{booking.user?.fullname?.firstname} {booking.user?.fullname?.lastname}</p>
                              <p className="text-sm text-gray-500">{booking.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium">{booking.hotelBooking?.hotelName}</p>
                            <p className="text-sm text-gray-500">{booking.hotelBooking?.nights} nights</p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <p>{new Date(booking.hotelBooking?.checkIn).toLocaleDateString()}</p>
                            <p className="text-gray-500">{new Date(booking.hotelBooking?.checkOut).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold">{booking.pricing?.currency} {booking.pricing?.totalAmount?.toLocaleString()}</td>
                          <td className="px-6 py-4"><StatusBadge status={booking.status} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleBookingAction(booking._id, 'confirmed')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Confirm"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {booking.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleBookingAction(booking._id, 'cancelled')}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-700">
                    Showing {(filters.page - 1) * filters.limit + 1} to {Math.min(filters.page * filters.limit, data.totalDocs)} of {data.totalDocs}
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">Previous</button>
                    <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= data.totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search hotels..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                <span>Add Hotel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : data.docs.length === 0 ? (
                <div className="col-span-3 text-center py-12 text-gray-500">No hotels found</div>
              ) : (
                data.docs.map((hotel) => (
                  <div key={hotel._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Hotel className="w-20 h-20 text-white opacity-50" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <StatusBadge status={hotel.isActive ? 'active' : 'inactive'} />
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hotel.location?.city}, {hotel.location?.country}
                      </div>
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{hotel.rating || 0}</span>
                        <span className="text-sm text-gray-500 ml-1">({hotel.totalReviews || 0} reviews)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-600">Rooms</p>
                          <p className="font-semibold">{hotel.rooms?.length || 0}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-600">Base Price</p>
                          <p className="font-semibold">PKR {hotel.rooms?.[0]?.basePrice || 0}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100">
                          <Edit className="w-4 h-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {data.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button onClick={() => handlePageChange(filters.page - 1)} disabled={filters.page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
                <span className="px-4 py-2">Page {filters.page} of {data.totalPages}</span>
                <button onClick={() => handlePageChange(filters.page + 1)} disabled={filters.page >= data.totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Search payments..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <button onClick={loadData} className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button onClick={handleExport} className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></td></tr>
                  ) : data.docs.length === 0 ? (
                    <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">No payments found</td></tr>
                  ) : (
                    data.docs.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-blue-600">{payment.paymentId}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{payment.userId?.fullname?.firstname} {payment.userId?.fullname?.lastname}</p>
                            <p className="text-sm text-gray-500">{payment.userId?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold">{payment.currency} {payment.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                            {payment.method || 'HBLPay'}
                          </span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
                        <td className="px-6 py-4 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Search tickets..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500" />
                </div>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={loadData} className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : data.docs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No tickets found</div>
              ) : (
                data.docs.map((ticket) => (
                  <div key={ticket._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <StatusBadge status={ticket.status} />
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {ticket.priority?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center"><User className="w-4 h-4 mr-1" />{ticket.user?.fullname?.firstname} {ticket.user?.fullname?.lastname}</span>
                          <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{ticket.user?.email}</span>
                          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Ticket #: {ticket.ticketNumber}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  General Settings
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                    <input type="text" defaultValue="TeliTrip" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                    <input type="email" defaultValue="support@telitrip.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>PKR - Pakistani Rupee</option>
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                    </select>
                  </div>
                  <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add extra security layer</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Enable</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">Auto logout after inactivity</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Login Activity</p>
                      <p className="text-sm text-gray-600">View recent login history</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium">View Logs</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-yellow-600" />
                  Notification Settings
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Email on new bookings', checked: true },
                    { label: 'Email on cancellations', checked: true },
                    { label: 'Email on payments', checked: false },
                    { label: 'Email on support tickets', checked: true },
                    { label: 'Daily reports', checked: false }
                  ].map((item, index) => (
                    <label key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  Payment Gateway
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">HBLPay Status</p>
                        <p className="text-sm text-green-600">Connected & Active</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Sandbox (Test)</option>
                      <option>Production (Live)</option>
                    </select>
                  </div>
                  <button className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    Configure Gateway
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Admin Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    defaultValue={adminData.fullname?.firstname} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue={adminData.fullname?.lastname} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    defaultValue={adminData.email} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input 
                    type="tel" 
                    defaultValue={adminData.phone} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium mb-4">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Update Password
                </button>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
                <Zap className="w-5 h-5 mr-2" />
                System Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Version</p>
                  <p className="text-xl font-bold text-blue-900">v1.0.0</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Environment</p>
                  <p className="text-xl font-bold text-blue-900">Development</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="text-xl font-bold text-blue-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;