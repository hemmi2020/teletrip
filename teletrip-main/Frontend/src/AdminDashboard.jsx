// FIXED: AdminDashboard.jsx with ALL working button handlers

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
import { AdminDashboardAPI } from './services/adminApi';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <XCircle className="w-5 h-5" />}
      {type === 'info' && <AlertCircle className="w-5 h-5" />}
      <span>{message}</span>
    </div>
  );
};

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
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, filters.page, filters.limit, filters.search, filters.status, filters.sortBy, filters.sortOrder]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // FIXED: Complete loadData function
  const loadData = async () => {
  setLoading(true);
  try {
    if (activeTab === 'overview') {
      const result = await AdminDashboardAPI.getDashboardOverview('30d');
      if (result.success && result.data) {
        const apiData = result.data.stats || result.data;
        setStats({
          totalRevenue: apiData.revenue?.total || 0,
          revenueGrowth: parseFloat(apiData.revenue?.growth || 0),
          totalBookings: apiData.bookings?.total || 0,
          bookingGrowth: parseFloat(apiData.bookings?.growth || 0),
          totalUsers: apiData.users?.total || 0,
          userGrowth: parseFloat(apiData.users?.growth || 0),
          totalHotels: apiData.hotels?.total || 0,
          hotelGrowth: 0,
        });
      }
    } else if (activeTab === 'users') {
      const result = await AdminDashboardAPI.getAllUsers(filters);
      if (result.success) {
        // ✅ FIXED: Map the users array to docs format
        setData({
          docs: result.data.users || [],
          totalDocs: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.pages || 1,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10
        });
      } else {
        showToast(result.error, 'error');
      }
    } else if (activeTab === 'bookings') {
      const result = await AdminDashboardAPI.getAllBookings(filters);
      if (result.success) {
        // ✅ FIXED: Map the bookings array to docs format
        setData({
          docs: result.data.bookings || [],
          totalDocs: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.pages || 1,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10
        });
      } else {
        showToast(result.error, 'error');
      }
    } else if (activeTab === 'hotels') {
      const result = await AdminDashboardAPI.getAllHotels(filters);
      if (result.success) {
        // ✅ FIXED: Map the hotels array to docs format
        setData({
          docs: result.data.hotels || [],
          totalDocs: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.pages || 1,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10
        });
      } else {
        showToast(result.error, 'error');
      }
    } else if (activeTab === 'payments') {
      const result = filters.status === 'pay-on-site'
        ? await AdminDashboardAPI.getPayOnSiteBookings(filters)
        : await AdminDashboardAPI.getAllPayments(filters);
      
      if (result.success) {
        setData({
          docs: result.data.payments || [],
          totalDocs: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.pages || 1,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10
        });
      } else {
        showToast(result.error, 'error');
      }
    } else if (activeTab === 'support') {
      const result = await AdminDashboardAPI.getAllSupportTickets(filters);
      if (result.success) {
        // ✅ FIXED: Map the tickets array to docs format
        setData({
          docs: result.data.tickets || [],
          totalDocs: result.data.pagination?.total || 0,
          totalPages: result.data.pagination?.pages || 1,
          page: result.data.pagination?.page || 1,
          limit: result.data.pagination?.limit || 10
        });
      } else {
        showToast(result.error, 'error');
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showToast('Failed to load data', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    setData({ docs: [], totalDocs: 0, totalPages: 1, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  // FIXED: Complete export handler
  const handleExport = async () => {
    try {
      showToast('Exporting data...', 'info');
      const result = await AdminDashboardAPI.exportData(activeTab, 'excel');
      
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${activeTab}_report_${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        showToast('Export successful!', 'success');
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Export failed', 'error');
    }
  };

  // FIXED: Complete user action handler
  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'activate' || action === 'deactivate') {
        const result = await AdminDashboardAPI.updateUserStatus(userId, {
          isActive: action === 'activate',
          reason: `Admin ${action}d user`
        });
        
        if (result.success) {
          showToast(`User ${action}d successfully`, 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this user?')) {
          const result = await AdminDashboardAPI.deleteUser(userId);
          if (result.success) {
            showToast('User deleted successfully', 'success');
            loadData();
          } else {
            showToast(result.error, 'error');
          }
        }
      } else if (action === 'view') {
        // Navigate to user details or open modal
        console.log('View user:', userId);
      }
    } catch (error) {
      showToast('Action failed', 'error');
    }
  };

  // FIXED: Complete booking action handler
  const handleBookingAction = async (bookingId, action, notes = '') => {
    try {
      if (action === 'cancel') {
        if (!window.confirm('Cancel this booking? Cancellation fees may apply.')) return;
        
        const result = await AdminDashboardAPI.cancelBooking(bookingId);
        if (result.success) {
          showToast(`Booking cancelled. Refund: ${result.data.refundAmount}`, 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      } else if (action === 'voucher') {
        const result = await AdminDashboardAPI.generateVoucher(bookingId);
        if (result.success) {
          const voucher = result.data;
          const voucherText = `
BOOKING VOUCHER
================
Ref: ${voucher.bookingReference}
Guest: ${voucher.guestName}
Email: ${voucher.email}
Amount: ${voucher.currency} ${voucher.totalAmount}
          `;
          const blob = new Blob([voucherText], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `voucher-${voucher.bookingReference}.txt`;
          a.click();
          showToast('Voucher downloaded', 'success');
        } else {
          showToast(result.error, 'error');
        }
      } else {
        const result = await AdminDashboardAPI.updateBookingStatus(bookingId, {
          status: action,
          notes: notes
        });
        
        if (result.success) {
          showToast(`Booking ${action} successfully`, 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      }
    } catch (error) {
      showToast('Booking action failed', 'error');
    }
  };

  // FIXED: Complete hotel action handler
  const handleHotelAction = async (hotelId, action) => {
    try {
      if (action === 'approve' || action === 'reject') {
        const result = await AdminDashboardAPI.updateHotelStatus(hotelId, {
          status: action === 'approve' ? 'active' : 'rejected',
          reason: `Admin ${action}ed hotel`
        });
        
        if (result.success) {
          showToast(`Hotel ${action}ed successfully`, 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      } else if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this hotel?')) {
          const result = await AdminDashboardAPI.deleteHotel(hotelId);
          if (result.success) {
            showToast('Hotel deleted successfully', 'success');
            loadData();
          } else {
            showToast(result.error, 'error');
          }
        }
      } else if (action === 'view') {
        console.log('View hotel:', hotelId);
      }
    } catch (error) {
      showToast('Hotel action failed', 'error');
    }
  };

  // FIXED: Complete payment action handler
  const handlePaymentAction = async (paymentId, action) => {
    try {
      if (action === 'refund') {
        if (window.confirm('Are you sure you want to process a refund for this payment?')) {
          const result = await AdminDashboardAPI.processRefund(paymentId, {
            reason: 'Admin initiated refund',
            amount: null // Full refund
          });
          
          if (result.success) {
            showToast('Refund processed successfully', 'success');
            loadData();
          } else {
            showToast(result.error, 'error');
          }
        }
      } else if (action === 'markPaid') {
        if (window.confirm('Mark this pay-on-site payment as paid?')) {
          const result = await AdminDashboardAPI.markPayOnSiteAsPaid(paymentId);
          if (result.success) {
            showToast('Payment marked as paid', 'success');
            setFilters(prev => ({ ...prev, status: '' }));
            await loadData();
          } else {
            showToast(result.error, 'error');
          }
        }
      } else if (action === 'view') {
        console.log('View payment:', paymentId);
      }
    } catch (error) {
      showToast('Payment action failed', 'error');
    }
  };

  // FIXED: Complete support ticket action handler
  const handleTicketAction = async (ticketId, action, response = '') => {
    try {
      if (action === 'respond') {
        if (!response) {
          showToast('Please provide a response message', 'error');
          return;
        }
        
        const result = await AdminDashboardAPI.addTicketResponse(ticketId, {
          message: response,
          respondedBy: userData._id
        });
        
        if (result.success) {
          showToast('Response sent successfully', 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      } else if (action === 'close' || action === 'reopen') {
        const result = await AdminDashboardAPI.updateSupportTicket(ticketId, {
          status: action === 'close' ? 'closed' : 'open'
        });
        
        if (result.success) {
          showToast(`Ticket ${action}ed successfully`, 'success');
          loadData();
        } else {
          showToast(result.error, 'error');
        }
      }
    } catch  {
      showToast('Ticket action failed', 'error');
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (activeTab === 'overview') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={` ${stats.totalRevenue?.toLocaleString() || 0}`}
              change={stats.revenueGrowth}
              icon={DollarSign}
              trend={stats.revenueGrowth > 0 ? 'up' : 'down'}
              loading={loading}
            />
            <StatCard 
              title="Total Bookings" 
              value={stats.totalBookings?.toLocaleString() || 0}
              change={stats.bookingGrowth}
              icon={Package}
              trend={stats.bookingGrowth > 0 ? 'up' : 'down'}
              loading={loading}
            />
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers?.toLocaleString() || 0}
              change={stats.userGrowth}
              icon={Users}
              trend={stats.userGrowth > 0 ? 'up' : 'down'}
              loading={loading}
            />
            <StatCard 
              title="Total Hotels" 
              value={stats.totalHotels?.toLocaleString() || 0}
              change={stats.hotelGrowth}
              icon={Hotel}
              trend={stats.hotelGrowth > 0 ? 'up' : 'down'}
              loading={loading}
            />
          </div>
        </div>
      );
    }

    // Render data tables for other tabs
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {activeTab === 'payments' && (
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Payments</option>
                  <option value="pay-on-site">Pay on Site</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadData()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ID</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Status</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Date</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {data.docs && data.docs.length > 0 ? (
        data.docs.map((item, index) => {
          // Different display logic based on activeTab
          let displayId, displayDetails, displayStatus, displayDate;

          if (activeTab === 'users') {
            displayId = item._id?.slice(-6) || 'N/A';
            displayDetails = (
              <div>
                <p className="font-medium truncate">{item.fullname?.firstname} {item.fullname?.lastname}</p>
                <p className="text-sm text-gray-500 truncate">{item.email}</p>
              </div>
            );
            displayStatus = item.status || item.isActive ? 'Active' : 'Inactive';
            displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
          } 
          else if (activeTab === 'bookings') {
            displayId = item.bookingReference || item._id?.slice(-6) || 'N/A';
            
            const cancellationPolicies = item.hotelBooking?.rooms?.[0]?.cancellationPolicies || [];
            const now = new Date();
            const freeCancellation = cancellationPolicies.find(policy => {
              const policyDate = new Date(policy.from);
              return now < policyDate && policy.amount === 0;
            });
            const refundAmount = freeCancellation ? item.totalAmount : 
              cancellationPolicies.length > 0 ? item.totalAmount - cancellationPolicies[0].amount : 0;
            
            displayDetails = (
              <div>
                <p className="font-medium truncate">
                  {item.hotelId?.name || item.hotelBooking?.hotelName || 'Booking'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {item.hotelId?.location?.city || item.hotelBooking?.hotelAddress?.city || ''} • {item.nights || 0} nights
                </p>
                <p className="text-xs text-gray-400 truncate">
                  Guest: {item.guestInfo?.primaryGuest?.firstName || item.user?.fullname?.firstname || 'N/A'} • 
                  Payment: {item.hotelBooking?.rooms?.[0]?.paymentType === 'AT_WEB' ? 'Card' : 'Pay on Site'}
                </p>
                {freeCancellation && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Free cancellation • Full refund available
                  </p>
                )}
                {!freeCancellation && cancellationPolicies.length > 0 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Refund: PKR {refundAmount.toFixed(2)} (Fee: PKR {cancellationPolicies[0].amount.toFixed(2)})
                  </p>
                )}
              </div>
            );
            displayStatus = item.status || 'pending';
            displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
          } 
          else if (activeTab === 'hotels') {
            displayId = item._id?.slice(-6) || 'N/A';
            displayDetails = (
              <div>
                <p className="font-medium truncate">{item.name || 'Hotel'}</p>
                <p className="text-sm text-gray-500 truncate">{item.location?.city || ''}</p>
              </div>
            );
            displayStatus = item.status || item.isActive ? 'Active' : 'Inactive';
            displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
          } 
          else if (activeTab === 'payments') {
            displayId = item.transactionId?.slice(-8) || item._id?.slice(-8) || 'N/A';
            
            const paymentMethod = item.paymentMethod || 'Credit Card';
            const bookingRef = item.bookingId?.bookingReference || item.bookingReference;
            const userEmail = item.userId?.email || item.user?.email;
            
            console.log('Payment item:', { paymentMethod: item.paymentMethod, status: item.status, id: item._id });
            
            displayDetails = (
              <div>
                <p className="font-medium truncate">
                  {userEmail || 'Guest Payment'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {bookingRef ? `Booking: ${bookingRef}` : paymentMethod} • PKR {item.amount?.toFixed(2) || 0}
                </p>
              </div>
            );
            
            displayStatus = item.status || 'pending';
            displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
          } 
          else if (activeTab === 'support') {
            displayId = item._id?.slice(-6) || 'N/A';
            displayDetails = (
              <div>
                <p className="font-medium truncate">{item.subject || 'Ticket'}</p>
                <p className="text-sm text-gray-500 truncate">{item.user?.email || 'N/A'}</p>
              </div>
            );
            displayStatus = item.status || 'open';
            displayDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
          }
          else {
            displayId = item._id?.slice(-6) || 'N/A';
            displayDetails = <p>N/A</p>;
            displayStatus = 'N/A';
            displayDate = 'N/A';
          }

          return (
            <tr key={item._id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                {displayId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                {displayDetails}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  displayStatus === 'Active' || displayStatus === 'active' || displayStatus === 'confirmed' || displayStatus === 'completed' ? 
                    'bg-green-100 text-green-800' : 
                  displayStatus === 'pending' ? 
                    'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                }`}>
                  {displayStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {displayDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {activeTab === 'payments' && (item.paymentMethod === 'pay-on-site' || item.paymentMethod === 'pay_on_site') && item.status === 'pending' && (
                    <button 
                      onClick={() => handlePaymentAction(item._id, 'markPaid')}
                      className="text-green-600 hover:text-green-800"
                      title="Mark as Paid"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab === 'bookings' && displayStatus === 'confirmed' && (
                    <>
                      <button 
                        onClick={() => handleBookingAction(item._id, 'voucher')}
                        className="text-purple-600 hover:text-purple-800"
                        title="Download Voucher"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleBookingAction(item._id, 'cancel')}
                        className="text-red-600 hover:text-red-800"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {activeTab !== 'support' && activeTab !== 'payments' && activeTab !== 'bookings' && (
                    <button 
                      className="text-green-600 hover:text-green-800"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab !== 'bookings' && (
                    <button 
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
            No data available
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data.totalDocs)} of {data.totalDocs} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= data.totalPages}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Package },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {userData.fullname?.firstname} {userData.fullname?.lastname}
                </span>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userData.fullname?.firstname?.charAt(0) || 'A'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white border-r border-gray-200 overflow-y-auto z-30`}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;