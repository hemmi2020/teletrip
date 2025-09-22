// Updated AccountDashboard.jsx with Complete API Integration
import React, { useState, useContext, useEffect } from "react";
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Save, 
  X,
  Eye,
  Download,
  Star,
  Phone,
  Home,
  Shield,
  Bell,
  Settings,
  Camera,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Hotel,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  Heart,
  MessageSquare,
  FileText,
  Award,
  Target
} from "lucide-react";
import { UserDataContext } from './components/CartSystem';
import Header from './components/Header';
import Footer from './components/Footer';
import { DashboardAPIService, handleApiError, validateForm, formatCurrency, formatDate } from './services/dashboardApi';

// Custom Hook for Dashboard Data
const useDashboardData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const makeApiCall = async (apiCall, successMessage = "") => {
    setLoading(true);
    setError("");
    try {
      const result = await apiCall();
      if (result.success) {
        if (successMessage) {
          setSuccess(successMessage);
          setTimeout(() => setSuccess(""), 3000);
        }
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, setError, setSuccess, makeApiCall };
};

// Loading Component
const LoadingSpinner = ({ size = "default", text = "" }) => {
  const sizeClass = size === "small" ? "w-4 h-4" : size === "large" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div className="flex flex-col justify-center items-center p-4">
      <Loader2 className={`${sizeClass} animate-spin text-blue-600 mb-2`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ message, onRetry, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
    <div className="flex items-start justify-between">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
        <div>
          <p className="text-red-800">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-red-400 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// Success Message Component
const SuccessMessage = ({ message, onClose }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
        <p className="text-green-800">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-green-400 hover:text-green-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

// Dashboard Stats Component
const DashboardStats = ({ stats, loading }) => {
  if (loading) return <LoadingSpinner text="Loading statistics..." />;

  const statItems = [
    {
      title: "Total Bookings",
      value: stats?.bookings?.total || 0,
      icon: Package,
      color: "blue",
      trend: stats?.bookings?.growth || 0
    },
    {
      title: "Active Bookings", 
      value: stats?.bookings?.active || 0,
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats?.financial?.totalSpent || 0),
      icon: DollarSign,
      color: "purple",
      trend: stats?.financial?.growth || 0
    },
    {
      title: "Avg. Booking Value",
      value: formatCurrency(stats?.financial?.averageBookingValue || 0),
      icon: TrendingUp,
      color: "orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${item.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{item.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                </div>
              </div>
              {item.trend !== undefined && (
                <div className={`flex items-center ${item.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="text-sm ml-1">{Math.abs(item.trend)}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Profile Form Component
const ProfileForm = ({ profile, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
    gender: profile.gender || '',
    nationality: profile.nationality || '',
    address: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zipCode: profile.address?.zipCode || '',
      country: profile.address?.country || ''
    }
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData, {
      firstName: { required: true, minLength: 2, label: 'First Name' },
      lastName: { required: true, minLength: 2, label: 'Last Name' },
      email: { required: true, email: true, label: 'Email' },
      phone: { phone: true, label: 'Phone' }
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.firstName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.firstName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.lastName && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.lastName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              validationErrors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              validationErrors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {validationErrors.phone && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nationality
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., American, British, etc."
          />
        </div>

        {/* Address Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code
              </label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleInputChange('address.country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>
    </form>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onCancel, onViewDetails }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: "green", icon: CheckCircle, text: "Completed" },
      confirmed: { color: "blue", icon: Clock, text: "Confirmed" },
      pending: { color: "yellow", icon: Clock, text: "Pending" },
      cancelled: { color: "red", icon: XCircle, text: "Cancelled" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {booking.hotelId?.images?.[0] ? (
                <img 
                  src={booking.hotelId.images[0]} 
                  alt={booking.hotelId.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.hotelId?.name || 'Hotel Name'}
              </h3>
              <p className="text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {booking.hotelId?.location?.city || booking.hotelId?.location || 'Location'}
              </p>
              <p className="text-sm text-gray-500">
                Ref: {booking.bookingReference}
              </p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(booking.status)}
            <p className="text-lg font-bold text-gray-900 mt-2">
              {formatCurrency(booking.totalAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Check-in</p>
            <p className="font-medium">{formatDate(booking.checkInDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Check-out</p>
            <p className="font-medium">{formatDate(booking.checkOutDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Guests</p>
            <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
          </div>
          <div>
            <p className="text-gray-500">Room Type</p>
            <p className="font-medium">{booking.roomType || 'Standard'}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onViewDetails(booking._id)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onCancel(booking._id)}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main AccountDashboard Component
const AccountDashboard = () => {
  const { user, setUser } = useContext(UserDataContext);
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, error, success, setError, setSuccess, makeApiCall } = useDashboardData();

  // State management
  const [dashboardStats, setDashboardStats] = useState({});
  const [profile, setProfile] = useState({});
  const [bookings, setBookings] = useState({ docs: [], totalDocs: 0, totalPages: 1 });
  const [payments, setPayments] = useState({ docs: [], totalDocs: 0, totalPages: 1 });
  const [preferences, setPreferences] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [favorites, setFavorites] = useState({ docs: [] });
  const [reviews, setReviews] = useState({ docs: [] });

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Filter states
  const [bookingFilters, setBookingFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [paymentFilters, setPaymentFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Load initial data
  useEffect(() => {
    if (user?.email) {
      loadTabData(activeTab);
    }
  }, [activeTab, user]);

  // Load tab-specific data
  const loadTabData = async (tab) => {
    try {
      switch (tab) {
        case "overview": {
          const [statsRes, profileRes] = await Promise.all([
            makeApiCall(() => DashboardAPIService.getDashboardOverview()),
            makeApiCall(() => DashboardAPIService.getProfile())
          ]);
          setDashboardStats(statsRes || {});
          setProfile(profileRes || {});
          break;
        }
          
        case "profile": {
          const profileData = await makeApiCall(() => DashboardAPIService.getProfile());
          setProfile(profileData || {});
          break;
        }
          
        case "bookings": {
          const bookingsData = await makeApiCall(() => DashboardAPIService.getBookings(bookingFilters));
          setBookings(bookingsData || { docs: [], totalDocs: 0, totalPages: 1 });
          break;
        }
          
        case "payments": {
          const paymentsData = await makeApiCall(() => DashboardAPIService.getPaymentHistory(paymentFilters));
          setPayments(paymentsData || { docs: [], totalDocs: 0, totalPages: 1 });
          break;
        }
          
        case "settings": {
          const [prefsRes, notifRes] = await Promise.all([
            makeApiCall(() => DashboardAPIService.getPreferences()),
            makeApiCall(() => DashboardAPIService.getNotifications({ page: 1, limit: 10 }))
          ]);
          setPreferences(prefsRes || {});
          setNotifications(notifRes?.docs || []);
          break;
        }
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  // Profile management functions
  const handleUpdateProfile = async (profileData) => {
    try {
      const updatedProfile = await makeApiCall(
        () => DashboardAPIService.updateProfile(profileData),
        "Profile updated successfully!"
      );
      setProfile(updatedProfile);
      setUser({ ...user, ...updatedProfile });
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      await makeApiCall(
        () => DashboardAPIService.updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
        "Password updated successfully!"
      );
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password update error:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }

    try {
      const result = await makeApiCall(
        () => DashboardAPIService.uploadProfilePicture(file),
        "Profile picture updated successfully!"
      );
      setProfile({ ...profile, profilePicture: result.profilePicture });
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  // Booking management functions
  const handleCancelBooking = async (bookingId) => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    try {
      await makeApiCall(
        () => DashboardAPIService.cancelBooking(bookingId, reason),
        "Booking cancelled successfully!"
      );
      await loadTabData("bookings");
    } catch (error) {
      console.error('Cancel booking error:', error);
    }
  };

  const handleViewBookingDetails = async (bookingId) => {
    try {
      const bookingDetails = await makeApiCall(() => DashboardAPIService.getBookingDetails(bookingId));
      // You can open a modal here or navigate to a details page
      console.log('Booking details:', bookingDetails);
    } catch (error) {
      console.error('Get booking details error:', error);
    }
  };

  // Utility functions
  const downloadUserData = async () => {
    try {
      await makeApiCall(
        () => DashboardAPIService.downloadUserData(),
        "Download started! Check your downloads folder."
      );
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    const password = prompt("Please enter your password to confirm account deletion:");
    if (!password) return;

    try {
      await makeApiCall(
        () => DashboardAPIService.deleteAccount(password),
        "Account deletion initiated. You will be logged out shortly."
      );
      
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  // Pagination handlers
  const handleBookingPageChange = (page) => {
    setBookingFilters(prev => ({ ...prev, page }));
    loadTabData("bookings");
  };

  const handlePaymentPageChange = (page) => {
    setPaymentFilters(prev => ({ ...prev, page }));
    loadTabData("payments");
  };

  // Authentication check
  if (!user || !user.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to access your account.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "profile", label: "Profile", icon: User },
    { id: "bookings", label: "My Bookings", icon: Package },
    { id: "payments", label: "Payment History", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Messages */}
          {success && <SuccessMessage message={success} onClose={() => setSuccess("")} />}
          {error && <ErrorMessage message={error} onClose={() => setError("")} />}

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {profile.firstName || user.fullname?.firstname || user.email}!
                </h1>
                <p className="text-gray-600 mt-1">Manage your account and view your bookings</p>
                {profile.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Member since {formatDate(profile.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleTabChange(id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
                  <DashboardStats stats={dashboardStats} loading={loading} />

                  {/* Recent Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Bookings */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Bookings</h3>
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      {dashboardStats.upcoming?.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardStats.upcoming.slice(0, 3).map((booking, index) => (
                            <div key={booking._id || index} className="flex items-center justify-between border-l-4 border-blue-500 pl-4 py-2">
                              <div>
                                <p className="font-medium text-gray-900">{booking.hotelId?.name || 'Hotel'}</p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatCurrency(booking.totalAmount)}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No upcoming bookings</p>
                        </div>
                      )}
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      </div>
                      {dashboardStats.payments?.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardStats.payments.slice(0, 3).map((payment, index) => (
                            <div key={payment._id || index} className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                <p className="text-sm text-gray-500">{formatDate(payment.createdAt)}</p>
                              </div>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {payment.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No recent payments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <ProfileForm
                        profile={profile}
                        onSave={handleUpdateProfile}
                        onCancel={() => setIsEditingProfile(false)}
                        loading={loading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Full Name</p>
                              <p className="font-medium text-gray-900">
                                {profile.firstName} {profile.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{profile.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{profile.phone || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Date of Birth</p>
                              <p className="font-medium text-gray-900">
                                {profile.dateOfBirth ? formatDate(profile.dateOfBirth) : 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Change Password */}
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={handleUpdatePassword}
                            disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Shield className="w-4 h-4" />
                            <span>{loading ? 'Updating...' : 'Update Password'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === "bookings" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
                    <div className="flex space-x-4">
                      <select
                        value={bookingFilters.status}
                        onChange={(e) => {
                          setBookingFilters({...bookingFilters, status: e.target.value, page: 1});
                          loadTabData("bookings");
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => loadTabData("bookings")}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {loading && <LoadingSpinner text="Loading bookings..." />}
                  
                  {!loading && bookings.docs?.length > 0 ? (
                    <div className="space-y-6">
                      {bookings.docs.map((booking) => (
                        <BookingCard
                          key={booking._id}
                          booking={booking}
                          onCancel={handleCancelBooking}
                          onViewDetails={handleViewBookingDetails}
                        />
                      ))}
                      
                      {/* Pagination */}
                      {bookings.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                          <nav className="flex space-x-2">
                            <button
                              onClick={() => handleBookingPageChange(bookingFilters.page - 1)}
                              disabled={bookingFilters.page === 1}
                              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            {Array.from({ length: Math.min(5, bookings.totalPages) }, (_, i) => {
                              let pageNum;
                              if (bookings.totalPages <= 5) {
                                pageNum = i + 1;
                              } else {
                                const start = Math.max(1, bookingFilters.page - 2);
                                pageNum = start + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleBookingPageChange(pageNum)}
                                  className={`px-3 py-2 rounded-lg ${
                                    bookingFilters.page === pageNum
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => handleBookingPageChange(bookingFilters.page + 1)}
                              disabled={bookingFilters.page === bookings.totalPages}
                              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  ) : !loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                      <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Start Booking
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                    <div className="flex space-x-4">
                      <select
                        value={paymentFilters.status}
                        onChange={(e) => {
                          setPaymentFilters({...paymentFilters, status: e.target.value, page: 1});
                          loadTabData("payments");
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Payments</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <button
                        onClick={() => loadTabData("payments")}
                        disabled={loading}
                        className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>
                  </div>

                  {loading && <LoadingSpinner text="Loading payments..." />}

                  {!loading && payments.docs?.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Booking Reference
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Method
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {payments.docs.map((payment) => (
                              <tr key={payment._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                  {payment.transactionId || payment._id.slice(-8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {payment.bookingId?.bookingReference || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(payment.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    {payment.paymentMethod || 'Credit Card'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    payment.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {payment.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button 
                                    onClick={() => console.log('View receipt for:', payment._id)}
                                    className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Receipt</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Payment Pagination */}
                      {payments.totalPages > 1 && (
                        <div className="bg-white px-6 py-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Showing {((paymentFilters.page - 1) * paymentFilters.limit) + 1} to{' '}
                              {Math.min(paymentFilters.page * paymentFilters.limit, payments.totalDocs)} of{' '}
                              {payments.totalDocs} results
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePaymentPageChange(paymentFilters.page - 1)}
                                disabled={paymentFilters.page === 1}
                                className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => handlePaymentPageChange(paymentFilters.page + 1)}
                                disabled={paymentFilters.page === payments.totalPages}
                                className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments found</h3>
                      <p className="text-gray-500">You haven't made any payments yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-8">
                  {/* Notification Preferences */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive booking confirmations and updates</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            defaultChecked={preferences.emailNotifications !== false}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                            <p className="text-sm text-gray-500">Receive booking reminders via SMS</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            defaultChecked={preferences.smsNotifications === true}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Marketing Communications</h4>
                            <p className="text-sm text-gray-500">Receive promotional offers and news</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            defaultChecked={preferences.marketingEmails === true}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Recent Notifications */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Notifications</h3>
                    {loading && <LoadingSpinner text="Loading notifications..." />}
                    
                    {!loading && notifications.length > 0 ? (
                      <div className="space-y-4">
                        {notifications.map((notification, index) => (
                          <div key={notification._id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                            <Bell className="w-5 h-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-500">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => makeApiCall(() => DashboardAPIService.markNotificationAsRead(notification._id))}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : !loading && (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No notifications</p>
                      </div>
                    )}
                  </div>

                  {/* Account Management */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Download My Data</h4>
                            <p className="text-sm text-gray-500">Get a copy of all your account data</p>
                          </div>
                        </div>
                        <button
                          onClick={downloadUserData}
                          disabled={loading}
                          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Download'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center space-x-3">
                          <Trash2 className="w-5 h-5 text-red-600" />
                          <div>
                            <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & Security */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Privacy & Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                          Enable
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Login Activity</h4>
                            <p className="text-sm text-gray-500">View recent login activity and manage sessions</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                          View Activity
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AccountDashboard;