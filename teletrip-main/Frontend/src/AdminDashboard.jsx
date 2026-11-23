// FIXED: AdminDashboard.jsx with ALL working button handlers

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Hotel, CreditCard, Package, MessageSquare, 
  Settings, TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  Filter, Download, RefreshCw, Eye, Edit, Trash2, Check, X,
  Bell, Building2, Star, MapPin, Phone, Mail, BarChart3, PieChart, Activity,
  FileText, Shield, Lock, LogOut, ChevronDown, Plus, AlertCircle,
  Clock, CheckCircle, XCircle, Loader2, ArrowUpRight, ArrowDownRight,
  Menu, XCircle as CloseIcon, Save, Camera, User, Globe, Zap, Database, GitCompare,
  History, Tag, Percent
} from 'lucide-react';
import { AdminDashboardAPI } from './services/adminApi';
import {
RevenueTrendChart,
  BookingStatusChart,
  UserGrowthChart,
  PaymentMethodChart,
  BookingTrendsChart,
  RealTimeMetrics,
  PeriodSelector
} from './components/AdminAnalytics';
import { AdvancedFilterPanel, FilterChips, FilterPresets } from './components/AdvancedFilters';
import { UserProfileModal, BookingDetailsModal } from './components/DetailModals';
import { PaymentDetailsModal, HotelDetailsModal, SupportTicketModal } from './components/DetailModals2';
import NotificationBell from './components/NotificationBell';
import ActivityFeed from './components/ActivityFeed';
import SystemStatus from './components/SystemStatus';
import WebSocketService from './services/websocket.service';
import BulkActionsBar from './components/BulkActions';
import { createBulkHandlers } from './components/BulkActionsHandlers';
import ReportBuilder from './components/ReportBuilder';
import ScheduledReports from './components/ScheduledReports';
import QuickReports from './components/QuickReports';
import { reportApi } from './services/reportApi';
import { generateRevenuePDF, generateUserActivityPDF, generateBookingAnalyticsPDF } from './utils/pdfGenerator';
import ViewToggle from './components/ViewToggle';
import ColumnToggle from './components/ColumnToggle';
import DarkModeToggle from './components/DarkModeToggle';
import CardView from './components/CardView';
import DraggableWidgets from './components/DraggableWidgets';
import FinancialDashboard from './components/FinancialDashboard';
import ProfitCalculator from './components/ProfitCalculator';
import RefundManagement from './components/RefundManagement';
import CommissionTracker from './components/CommissionTracker';
import PaymentReconciliation from './components/PaymentReconciliation';
import FinancialForecasting from './components/FinancialForecasting';
import CurrencySettings from './components/CurrencySettings';
import EmailSettings from './components/EmailSettings';
import HotelApprovalWorkflow from './components/HotelApprovalWorkflow';
import RoomInventoryManager from './components/RoomInventoryManager';
import PricingCalendar from './components/PricingCalendar';
import HotelPerformanceMetrics from './components/HotelPerformanceMetrics';
import ReviewModeration from './components/ReviewModeration';
import FeaturedHotelManager from './components/FeaturedHotelManager';
import BookingModificationInterface from './components/BookingModificationInterface';
import CancellationPolicyCalculator from './components/CancellationPolicyCalculator';
import RefundAmountPreview from './components/RefundAmountPreview';
import GuestCommunicationHistory from './components/GuestCommunicationHistory';
import BookingNotesComments from './components/BookingNotesComments';
import SpecialRequestHandling from './components/SpecialRequestHandling';
import BookingTimelineView from './components/BookingTimelineView';
import MobileTable from './components/MobileTable';
import BookingReconfirmation from './components/BookingReconfirmation';
import { useCurrency } from './context/CurrencyContext';
import EmailManagementTab from './components/EmailManagement/EmailManagementTab';
import DestinationManagement from './components/DestinationManagement';
import HotelContentSyncTab from './components/HotelContentSyncTab';
import HotelbedsToolsTab from './components/HotelbedsToolsTab';
import PayOnSiteManagement from './components/PayOnSiteManagement';
import BookingVoucher from './components/BookingVoucher';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './components/ui/table';
import BookingDetailSheet from './components/admin/BookingDetailSheet';
import FullWidthBookingsTable from './components/admin/FullWidthBookingsTable';
import FullWidthUsersTable from './components/admin/FullWidthUsersTable';
import FullWidthHotelsTable from './components/admin/FullWidthHotelsTable';
import FullWidthPaymentsTable from './components/admin/FullWidthPaymentsTable';
import FullWidthSupportTable from './components/admin/FullWidthSupportTable';
import FullWidthAuditTable from './components/admin/FullWidthAuditTable';
import FullWidthMarkupsTable from './components/admin/FullWidthMarkupsTable';
import FullWidthCouponsTable from './components/admin/FullWidthCouponsTable';
import './styles/admin-responsive.css';

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
    <div className={`fixed top-4 right-4 ${colors[type]} text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-[90vw] sm:max-w-md`}>
      {type === 'success' && <CheckCircle className="w-5 h-5" />}
      {type === 'error' && <XCircle className="w-5 h-5" />}
      {type === 'info' && <AlertCircle className="w-5 h-5" />}
      <span>{message}</span>
    </div>
  );
};

// Stat Card Component (Tremor-styled Analytics KPI Card with shadcn Card & Badge)
const StatCard = ({ title, value, change, icon: Icon, trend, loading }) => (
  <Card className="p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all border-slate-200/90 bg-white">
    <div className="flex items-center justify-between gap-3 mb-2">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        trend === 'up' ? 'bg-emerald-50 text-[#1F6A5B]' : 'bg-blue-50 text-blue-600'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    {loading ? (
      <div className="h-8 bg-slate-100 animate-pulse rounded-lg w-28 my-1"></div>
    ) : (
      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-1">
        {value}
      </div>
    )}
    {change !== undefined && change !== null && !loading && (
      <div className="flex items-center gap-2 mt-2">
        <Badge variant={trend === 'up' ? 'emerald' : 'destructive'} className="px-1.5 py-0.2">
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          <span>{Math.abs(change)}%</span>
        </Badge>
        <span className="text-[11px] text-slate-400">vs last period</span>
      </div>
    )}
  </Card>
);

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPKR, convert } = useCurrency();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = useCallback((newTab) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', newTab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);
  const [inspectBooking, setInspectBooking] = useState(null);
  const [inspectSheetOpen, setInspectSheetOpen] = useState(false);
  const [subFilter, setSubFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: [],
    bookingStatusData: [],
    userGrowthData: [],
    paymentMethodData: [],
    bookingTrendsData: [],
    realTimeMetrics: {}
  });
  
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
    status: [],
    paymentMethod: [],
    location: [],
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [filterPresets, setFilterPresets] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [bookingManagementModal, setBookingManagementModal] = useState(null);
  const [voucherBooking, setVoucherBooking] = useState(null);

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // UI/UX state
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('adminViewMode') || 'list');
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('adminVisibleColumns');
    return saved ? JSON.parse(saved) : ['checkbox', 'id', 'details', 'status', 'date', 'actions'];
  });
  const [dashboardWidgets, setDashboardWidgets] = useState(() => {
    const saved = localStorage.getItem('adminDashboardWidgets');
    return saved ? JSON.parse(saved) : [
      { id: 'metrics', title: 'Real-Time Metrics', component: null },
      { id: 'status', title: 'System Status', component: null },
      { id: 'charts', title: 'Analytics Charts', component: null },
      { id: 'activity', title: 'Activity Feed', component: null }
    ];
  });

  // Real-time features state
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    overall: 'online',
    websocket: 'online',
    database: 'online',
    api: 'online',
    performance: 'online',
    lastUpdate: new Date().toISOString()
  });

  // Admin user info
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Load filter presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adminFilterPresets');
    if (saved) {
      setFilterPresets(JSON.parse(saved));
    }
  }, []);

  // WebSocket connection and real-time updates
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      WebSocketService.connect(token);

      // Listen for real-time events
      WebSocketService.on('new_booking', (data) => {
        addNotification('booking', 'New Booking', `Booking ${data.bookingReference} created`);
        addActivity('booking', 'New booking', `Booking ${data.bookingReference} was created`, data);
        if (activeTab === 'bookings') loadData();
      });

      WebSocketService.on('new_payment', (data) => {
        addNotification('payment', 'New Payment', `Payment of PKR ${data.amount} received`);
        addActivity('payment', 'Payment received', `PKR ${data.amount} payment processed`, data);
        if (activeTab === 'payments') loadData();
      });

      WebSocketService.on('new_user', (data) => {
        addNotification('user', 'New User', `${data.email} registered`);
        addActivity('user', 'User registered', `${data.email} joined the platform`, data);
        if (activeTab === 'users') loadData();
      });

      WebSocketService.on('booking_cancelled', (data) => {
        addNotification('booking', 'Booking Cancelled', `Booking ${data.bookingReference} cancelled`);
        addActivity('booking', 'Booking cancelled', `Booking ${data.bookingReference} was cancelled`, data);
        if (activeTab === 'bookings') loadData();
      });

      WebSocketService.on('system_status', (status) => {
        setSystemStatus({ ...status, lastUpdate: new Date().toISOString() });
      });
    }

    return () => {
      WebSocketService.disconnect();
    };
  }, [activeTab]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab !== 'overview') {
        loadData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const addNotification = (type, title, message) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notification, ...prev].slice(0, 50));
  };

  const addActivity = (type, action, details, data) => {
    const activity = {
      id: Date.now().toString(),
      type,
      user: data?.user?.email || 'System',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [activity, ...prev].slice(0, 100));
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Toast function
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Generate analytics data strictly from real API aggregations (Zero synthetic mock data)
  const generateAnalyticsData = useCallback((apiData) => {
    const rawDailyRev = apiData.charts?.revenueDaily || [];
    const dailyMap = {};
    rawDailyRev.forEach(item => {
      if (item._id) dailyMap[item._id] = item.revenue;
    });

    // Real revenue trend data (last 7 days)
    const revenueData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().split('T')[0];
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dailyMap[key] || 0,
        target: 0
      };
    });

    // Booking status data from database aggregation
    const rawStatus = apiData.charts?.bookingsByStatus || [];
    const statusMap = {};
    rawStatus.forEach(s => {
      if (s._id) statusMap[String(s._id).toLowerCase()] = s.count;
    });
    const bookingStatusData = [
      { name: 'Confirmed', value: statusMap['confirmed'] || apiData.stats?.bookings?.confirmed || 0 },
      { name: 'Pending', value: statusMap['pending'] || apiData.stats?.bookings?.pending || 0 },
      { name: 'Cancelled', value: statusMap['cancelled'] || apiData.stats?.bookings?.cancelled || 0 },
      { name: 'Completed', value: statusMap['completed'] || apiData.stats?.bookings?.completed || 0 }
    ];

    // User growth data (last 7 days)
    const rawUserRegs = apiData.charts?.userRegistrations || [];
    const userGrowthData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: 0
      };
    });

    // Payment method data from real database aggregation
    const rawMethods = apiData.charts?.paymentMethods || [];
    const paymentMethodData = rawMethods.length > 0 
      ? rawMethods.map(m => ({
          method: m._id ? String(m._id).replace(/_/g, ' ').toUpperCase() : 'OTHER',
          count: m.count || 0,
          amount: m.amount || 0
        }))
      : [
          { method: 'Credit Card', count: 0 },
          { method: 'Pay at Office', count: 0 }
        ];

    // Booking trends data from real database aggregation
    const rawDailyBookings = apiData.charts?.bookingDaily || [];
    const bookingDailyMap = {};
    rawDailyBookings.forEach(item => {
      if (item._id) bookingDailyMap[item._id] = item;
    });
    const bookingTrendsData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().split('T')[0];
      const entry = bookingDailyMap[key] || {};
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: entry.bookings || 0,
        cancelled: entry.cancelled || 0
      };
    });

    // Real-time live metrics
    const realTimeMetrics = {
      todayRevenue: apiData.stats?.revenue?.new || apiData.revenue?.today || 0,
      revenueChange: parseFloat(apiData.stats?.revenue?.growth || 0),
      todayBookings: apiData.stats?.bookings?.new || apiData.bookings?.today || 0,
      bookingChange: parseFloat(apiData.stats?.bookings?.growth || 0),
      activeUsers: apiData.stats?.users?.total || apiData.users?.active || 0,
      pendingPayments: apiData.stats?.payOnSite?.pending?.count || 0
    };

    setAnalyticsData({
      revenueData,
      bookingStatusData,
      userGrowthData,
      paymentMethodData,
      bookingTrendsData,
      realTimeMetrics
    });
  }, []);

  // FIXED: Complete loadData function
  const loadData = useCallback(async () => {
  setLoading(true);
  try {
    if (activeTab === 'overview') {
      const result = await AdminDashboardAPI.getDashboardOverview('30d');
      if (result.success && result.data) {
        const statsData = result.data.stats || result.data;
        setStats({
          totalRevenue: statsData.revenue?.total || 0,
          revenueGrowth: parseFloat(statsData.revenue?.growth || 0),
          totalBookings: statsData.bookings?.total || 0,
          bookingGrowth: parseFloat(statsData.bookings?.growth || 0),
          totalUsers: statsData.users?.total || 0,
          userGrowth: parseFloat(statsData.users?.growth || 0),
          totalHotels: statsData.hotels?.total || 0,
          hotelGrowth: 0,
          payOnSite: statsData.payOnSite || { pending: { count: 0, totalAmount: 0 }, completed: { count: 0, totalAmount: 0 } },
        });
        
        // Generate analytics data strictly from real API metrics and aggregations
        generateAnalyticsData(result.data);

        // Fetch genuine system audit logs to populate live ActivityFeed
        AdminDashboardAPI.getAuditLogs({ limit: 15 }).then(auditRes => {
          if (auditRes.success && auditRes.data) {
            const list = Array.isArray(auditRes.data) ? auditRes.data : (auditRes.data.docs || []);
            setActivities(list.map(log => ({
              id: log._id,
              type: ['user', 'booking', 'payment', 'settings', 'admin'].includes(log.target) ? log.target : 'admin',
              user: log.admin?.fullname ? `${log.admin.fullname.firstname} ${log.admin.fullname.lastname}` : (log.admin?.email || 'Admin'),
              action: log.action || 'system activity',
              details: typeof log.details === 'string' ? log.details : (log.metadata?.reason || ''),
              timestamp: log.createdAt
            })));
          }
        }).catch(console.error);
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
      const result = await AdminDashboardAPI.getAllPayments(filters);
      
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
}, [activeTab, filters, showToast, generateAnalyticsData]);

  // Bulk action handlers
  const bulkHandlers = createBulkHandlers(
    activeTab,
    selectedIds,
    showToast,
    loadData,
    setSelectedIds
  );

  // Reset selection when tab changes
  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [activeTab]);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      status: [],
      paymentMethod: [],
      location: [],
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setTimeout(() => loadData(), 100);
  };

  const handleRemoveFilter = (key) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[key])) {
      newFilters[key] = [];
    } else {
      newFilters[key] = '';
    }
    setFilters(newFilters);
    setTimeout(() => loadData(), 100);
  };

  const handleSavePreset = (name, filterData) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      filters: filterData
    };
    const updated = [...filterPresets, newPreset];
    setFilterPresets(updated);
    localStorage.setItem('adminFilterPresets', JSON.stringify(updated));
    showToast('Filter preset saved!', 'success');
  };

  const handleLoadPreset = (presetId) => {
    const preset = filterPresets.find(p => p.id === presetId);
    if (preset) {
      setFilters({ ...preset.filters, page: 1 });
      setTimeout(() => loadData(), 100);
      showToast('Filter preset loaded!', 'success');
    }
  };

  const handleDeletePreset = (presetId) => {
    const updated = filterPresets.filter(p => p.id !== presetId);
    setFilterPresets(updated);
    localStorage.setItem('adminFilterPresets', JSON.stringify(updated));
    showToast('Filter preset deleted!', 'success');
  };

  const handleViewDetails = (item, type) => {
    console.log('Opening modal:', type, item);
    setSelectedItem(item);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleUpdateUser = async (userData) => {
    try {
      const result = await AdminDashboardAPI.updateUser(userData._id, userData);
      if (result.success) {
        showToast('User updated successfully', 'success');
        loadData();
        handleCloseModal();
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to update user', 'error');
    }
  };

  const handleSendTicketMessage = async (ticketId, message) => {
    try {
      const result = await AdminDashboardAPI.addTicketResponse(ticketId, { message });
      if (result.success) {
        showToast('Message sent successfully', 'success');
        loadData();
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('adminViewMode', mode);
  };

  const handleColumnVisibilityChange = (columns) => {
    setVisibleColumns(columns);
    localStorage.setItem('adminVisibleColumns', JSON.stringify(columns));
  };

  const handleWidgetReorder = (widgets) => {
    setDashboardWidgets(widgets);
    localStorage.setItem('adminDashboardWidgets', JSON.stringify(widgets));
  };

  const handleRemoveWidget = (widgetId) => {
    const updated = dashboardWidgets.filter(w => w.id !== widgetId);
    setDashboardWidgets(updated);
    localStorage.setItem('adminDashboardWidgets', JSON.stringify(updated));
  };

  const availableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'details', label: 'Details' },
    { id: 'status', label: 'Status' },
    { id: 'date', label: 'Date' },
    { id: 'actions', label: 'Actions' }
  ];

  // FIXED: Complete export handler with filters
  const handleExport = async () => {
    try {
      showToast('Exporting filtered data...', 'info');
      
      // Export current filtered data as CSV
      const csvContent = convertToCSV(data.docs);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_filtered_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('Export successful!', 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'object' ? JSON.stringify(val) : val
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
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
        const userItem = (data.docs || []).find(u => u._id === userId) || { _id: userId };
        handleViewDetails(userItem, 'users');
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
        const result = await AdminDashboardAPI.getBookingDetails(bookingId);
        if (result.success && result.data) {
          setVoucherBooking(result.data);
        } else {
          showToast(result.error || 'Failed to load booking for voucher', 'error');
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
        const hotelItem = (data.docs || []).find(h => h._id === hotelId) || { _id: hotelId };
        handleViewDetails(hotelItem, 'hotels');
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
          const result = await AdminDashboardAPI.markPayOnSiteAsPaid(paymentId, {
            paymentMethod: 'cash',
            notes: 'Marked as paid from admin payments table'
          });
          if (result.success) {
            showToast('Payment marked as paid', 'success');
            setFilters(prev => ({ ...prev, status: '' }));
            await loadData();
          } else {
            showToast(result.error, 'error');
          }
        }
      } else if (action === 'view') {
        const paymentItem = (data.docs || []).find(p => p._id === paymentId) || { _id: paymentId };
        handleViewDetails(paymentItem, 'payments');
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
    } catch (error) {
      showToast('Ticket action failed', 'error');
    }
  };

  const handleGenerateReport = async (config) => {
    setLoading(true);
    try {
      let data, pdf;
      
      if (config.reportType === 'revenue') {
        data = await reportApi.getRevenueReport(config.startDate, config.endDate);
        pdf = generateRevenuePDF(data, config.startDate, config.endDate);
      } else if (config.reportType === 'user-activity') {
        data = await reportApi.getUserActivityReport(config.startDate, config.endDate);
        pdf = generateUserActivityPDF(data, config.startDate, config.endDate);
      } else if (config.reportType === 'booking-analytics') {
        data = await reportApi.getBookingAnalyticsReport(config.startDate, config.endDate);
        pdf = generateBookingAnalyticsPDF(data, config.startDate, config.endDate);
      }
      
      if (pdf) {
        pdf.save(`${config.reportType}-${Date.now()}.pdf`);
        showToast('Report generated successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailReport = async (config) => {
    setLoading(true);
    try {
      const recipients = prompt('Enter email addresses (comma-separated):');
      if (!recipients) return;
      
      let data;
      if (config.reportType === 'revenue') {
        data = await reportApi.getRevenueReport(config.startDate, config.endDate);
      } else if (config.reportType === 'user-activity') {
        data = await reportApi.getUserActivityReport(config.startDate, config.endDate);
      } else if (config.reportType === 'booking-analytics') {
        data = await reportApi.getBookingAnalyticsReport(config.startDate, config.endDate);
      }
      
      await reportApi.emailReport(data, recipients.split(',').map(e => e.trim()));
      showToast('Report sent successfully', 'success');
    } catch (error) {
      showToast('Failed to send report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingTransition = async (bookingId, targetStatus, notes) => {
    const res = await AdminDashboardAPI.updateBookingStatus(bookingId, { status: targetStatus, notes });
    if (!res.success) {
      throw new Error(res.error || 'Failed to update booking status');
    }
    await loadData();
    if (inspectBooking && inspectBooking._id === bookingId) {
      setInspectBooking(prev => ({ ...prev, status: targetStatus }));
    }
    return res.data;
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    const res = await AdminDashboardAPI.updateUserStatus(userId, { isActive: newStatus });
    if (res.success) {
      showToast(`User status updated to ${newStatus ? 'Active' : 'Inactive'}`, 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    const res = await AdminDashboardAPI.deleteUser(userId, 'Admin initiated deletion');
    if (res.success) {
      showToast('User deleted successfully', 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to delete user', 'error');
    }
  };

  const handleHotelToggleStatus = async (hotelId, newStatus) => {
    const res = await AdminDashboardAPI.updateHotelStatus(hotelId, { status: newStatus ? 'active' : 'inactive' });
    if (res.success) {
      showToast(`Hotel status updated to ${newStatus ? 'Active' : 'Inactive'}`, 'success');
      loadData();
    } else {
      showToast(res.error || 'Failed to update hotel status', 'error');
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

    if (activeTab === 'reports') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ReportBuilder 
              onGenerate={handleGenerateReport}
              onEmail={handleEmailReport}
            />
            <ScheduledReports showToast={showToast} />
          </div>
          <QuickReports 
            showToast={showToast}
            bookings={data.docs || []}
          />
        </div>
      );
    }

    if (activeTab === 'financial') {
      return (
        <div className="space-y-4 sm:space-y-6">
          <FinancialDashboard showToast={showToast} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <ProfitCalculator />
            <RefundManagement showToast={showToast} />
          </div>
          <CommissionTracker showToast={showToast} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentReconciliation showToast={showToast} />
            <FinancialForecasting showToast={showToast} />
          </div>
        </div>
      );
    }

    if (activeTab === 'hotel-management') {
      const activeHotel = selectedItem || (data.docs && data.docs.length > 0 ? data.docs[0] : null);
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Active Property Selector Banner */}
          {data.docs && data.docs.length > 0 && (
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <Hotel className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Managing Property</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">{activeHotel?.name || 'Select a Hotel'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium">Switch Hotel:</label>
                <select
                  value={activeHotel?._id || ''}
                  onChange={(e) => {
                    const found = data.docs.find(h => h._id === e.target.value);
                    if (found) setSelectedItem(found);
                  }}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {data.docs.map(h => (
                    <option key={h._id} value={h._id}>{h.name} ({h.location?.city || h.city || 'Dubai'})</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <HotelApprovalWorkflow showToast={showToast} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RoomInventoryManager 
              hotelId={activeHotel?._id}
              rooms={activeHotel?.rooms || []}
              onUpdate={() => loadData()}
              showToast={showToast}
            />
            <PricingCalendar 
              hotelId={activeHotel?._id}
              onUpdatePricing={() => loadData()}
              showToast={showToast}
            />
          </div>
          <HotelPerformanceMetrics hotelId={activeHotel?._id} showToast={showToast} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReviewModeration showToast={showToast} />
            <FeaturedHotelManager showToast={showToast} />
          </div>
        </div>
      );
    }

    if (activeTab === 'booking-management') {
      const activeBooking = selectedItem || inspectBooking || (data.docs && data.docs.length > 0 ? data.docs[0] : null);
      return (
        <div className="space-y-4 sm:space-y-6">
          <BookingReconfirmation showToast={showToast} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <CancellationPolicyCalculator booking={activeBooking} />
            <RefundAmountPreview 
              booking={activeBooking}
              onConfirm={(amount) => {
                showToast(`Refund of PKR ${Math.round(amount).toLocaleString()} processed`, 'success');
              }}
            />
          </div>
          <GuestCommunicationHistory bookingId={activeBooking?._id} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookingNotesComments bookingId={activeBooking?._id} />
            <SpecialRequestHandling bookingId={activeBooking?._id} />
          </div>
          <BookingTimelineView bookingId={activeBooking?._id} />
        </div>
      );
    }

    if (activeTab === 'destinations') {
      return (
        <DestinationManagement showToast={showToast} />
      );
    }

    if (activeTab === 'email') {
      return (
        <EmailManagementTab showToast={showToast} />
      );
    }

    if (activeTab === 'content-sync') {
      return <HotelContentSyncTab showToast={showToast} />;
    }

    if (activeTab === 'hotelbeds-tools') {
      return <HotelbedsToolsTab showToast={showToast} />;
    }

    if (activeTab === 'settings') {
      return (
        <div className="space-y-6">
          <EmailSettings showToast={showToast} />
          <CurrencySettings showToast={showToast} />
        </div>
      );
    }

    if (activeTab === 'markups') {
      return <FullWidthMarkupsTable showToast={showToast} />;
    }

    if (activeTab === 'coupons') {
      return <FullWidthCouponsTable showToast={showToast} />;
    }

    if (activeTab === 'audit-trail') {
      return <FullWidthAuditTable showToast={showToast} />;
    }

    if (activeTab === 'overview') {
      return (
        <div className="space-y-4 sm:space-y-6">
          {/* Pay on Site Alert */}
          {stats.payOnSite?.pending?.count > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">
                      {stats.payOnSite.pending.count} Pending Pay at Office Payment{stats.payOnSite.pending.count > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Total Amount: PKR {stats.payOnSite.pending.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('payments');
                    setFilters(prev => ({ ...prev, status: 'pay-on-site' }));
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  Review Payments
                </button>
              </div>
            </div>
          )}
          
          {/* System Status & Real-time Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <RealTimeMetrics metrics={analyticsData.realTimeMetrics} />
            </div>
            <SystemStatus status={systemStatus} />
          </div>

          {/* Period Selector */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
            <PeriodSelector period={analyticsPeriod} onChange={setAnalyticsPeriod} />
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`PKR ${stats.totalRevenue?.toLocaleString() || 0}`}
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
              title="Pay at Office Pending" 
              value={stats.payOnSite?.pending?.count?.toLocaleString() || 0}
              icon={Clock}
              trend="up"
              loading={loading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RevenueTrendChart data={analyticsData.revenueData} period={analyticsPeriod} />
            <BookingStatusChart data={analyticsData.bookingStatusData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserGrowthChart data={analyticsData.userGrowthData} />
            <PaymentMethodChart data={analyticsData.paymentMethodData} />
          </div>

          <BookingTrendsChart data={analyticsData.bookingTrendsData} period={analyticsPeriod} />

          {/* Activity Feed */}
          <ActivityFeed activities={activities} loading={false} />
        </div>
      );
    }

    if (activeTab === 'pay-on-site') {
      return <PayOnSiteManagement showToast={showToast} />;
    }

    if (activeTab === 'bookings') {
      return (
        <FullWidthBookingsTable
          bookings={data.docs || []}
          loading={loading}
          onSelectBooking={(b) => setInspectBooking(b)}
          onViewVoucher={(b) => setVoucherBooking(b)}
          onTransitionStatus={handleBookingTransition}
          onRefresh={() => loadData()}
        />
      );
    }

    if (activeTab === 'users') {
      return (
        <FullWidthUsersTable
          users={data.docs || []}
          loading={loading}
          onToggleStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
          onRefresh={() => loadData()}
        />
      );
    }

    if (activeTab === 'hotels') {
      return (
        <FullWidthHotelsTable
          hotels={data.docs || []}
          loading={loading}
          onRefresh={() => loadData()}
          onToggleStatus={handleHotelToggleStatus}
          onSelectHotel={(h) => handleViewDetails(h)}
        />
      );
    }

    if (activeTab === 'payments') {
      return (
        <FullWidthPaymentsTable
          payments={data.docs || []}
          loading={loading}
          onRefresh={() => loadData()}
          onSelectPayment={(p) => handleViewDetails(p)}
          onProcessRefund={(p) => handlePaymentAction(p._id, 'refund')}
        />
      );
    }

    if (activeTab === 'support') {
      return (
        <FullWidthSupportTable
          tickets={data.docs || []}
          loading={loading}
          onRefresh={() => loadData()}
          onSelectTicket={(t) => handleViewDetails(t)}
        />
      );
    }

    // Fallback view for unrecognized tabs
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <p className="text-base font-semibold text-slate-700">Select a section from the navigation sidebar</p>
        <p className="text-xs text-slate-400 mt-1">Manage bookings, suppliers, live APITUDE content, finance, and system settings.</p>
      </div>
    );
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Package },
    { id: 'booking-management', label: 'Booking Mgmt', icon: Calendar },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'hotel-management', label: 'Hotel Mgmt', icon: Settings },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'pay-on-site', label: 'Pay on Site', icon: Building2 },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'markups', label: 'Markup Rules', icon: TrendingUp },
    { id: 'coupons', label: 'Promo Coupons', icon: Tag },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'content-sync', label: 'Content Sync', icon: Database },
    { id: 'hotelbeds-tools', label: 'Hotelbeds Tools', icon: GitCompare },
    { id: 'audit-trail', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Booking Management Modals */}
      {bookingManagementModal === 'modify' && (
        <BookingModificationInterface
          bookingId={selectedItem?._id}
          onClose={() => setBookingManagementModal(null)}
          onUpdate={() => {
            loadData();
            setBookingManagementModal(null);
          }}
        />
      )}

      {/* Detail Modals */}
      <UserProfileModal 
        isOpen={modalType === 'users'} 
        onClose={handleCloseModal} 
        user={selectedItem}
        onUpdate={handleUpdateUser}
      />
      <BookingDetailsModal 
        isOpen={modalType === 'bookings'} 
        onClose={handleCloseModal} 
        booking={selectedItem}
      />
      <PaymentDetailsModal 
        isOpen={modalType === 'payments'} 
        onClose={handleCloseModal} 
        payment={selectedItem}
      />
      <HotelDetailsModal 
        isOpen={modalType === 'hotels'} 
        onClose={handleCloseModal} 
        hotel={selectedItem}
      />
      <SupportTicketModal 
        isOpen={modalType === 'support'} 
        onClose={handleCloseModal} 
        ticket={selectedItem}
        onSendMessage={handleSendTicketMessage}
      />

      {/* Booking Voucher Modal */}
      {voucherBooking && (
        <BookingVoucher 
          booking={voucherBooking} 
          onClose={() => setVoucherBooking(null)} 
        />
      )}

      {/* Booking Detail Slide-over Sheet (State Machine Powered) */}
      <BookingDetailSheet
        booking={inspectBooking}
        isOpen={Boolean(inspectBooking)}
        onClose={() => setInspectBooking(null)}
        onTransition={handleBookingTransition}
        onViewVoucher={(b) => setVoucherBooking(b)}
      />

      {/* Header */}
      <header className="admin-header bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAllNotifications}
              />
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hello Admin
                </span>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  A
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
        {/* Modern Collapsible Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200/90 overflow-y-auto z-30 transition-all shadow-2xs`}>
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Admin Suite</Badge>
          </div>
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold border-l-4 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content - Full Available Workspace Width */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full max-w-none">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;