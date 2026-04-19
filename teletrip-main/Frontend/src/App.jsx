import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, UserProvider } from './components/CartSystem';
import { HelmetProvider } from 'react-helmet-async';
import { CurrencyProvider } from './context/CurrencyContext';

// Pages
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import HotelSearchResults from './HotelSearchResults';
import HotelDetails from './HotelDetails';
import ActivitySearchResults from './ActivitySearchResults';
import ActivityDetails from './ActivityDetails';
import TransferSearch from './TransferSearch';
import Checkout from './Checkout';
import AccountDashboard from './AccountDashboard';
import BookingManagement from './components/hotels/BookingManagement';
import BookingDetails from './components/hotels/BookingDetails';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';
import PaymentSuccessOnSite from './PaymentSuccessOnSite';
import Contact from './Contact';
import About from './About';
import FAQs from './FAQs';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';
import CancellationPolicy from './CancellationPolicy';

// Admin
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// Error pages
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <UserProvider>
              <CartProvider>
                <div className="pb-14 md:pb-0">
                  <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/hotel-search-results" element={<HotelSearchResults />} />
                    <Route path="/hotel-details/:hotelCode" element={<HotelDetails />} />
                    <Route path="/activity-search-results" element={<ActivitySearchResults />} />
                    <Route path="/activity/:activityCode" element={<ActivityDetails />} />
                    <Route path="/transfers" element={<TransferSearch />} />
                    <Route path="/account" element={<AccountDashboard />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                    <Route path="/bookings" element={<BookingManagement />} />
                    <Route path="/bookings/:bookingId" element={<BookingDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />
                    <Route path="/payment-success-onsite" element={<PaymentSuccessOnSite />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
                    <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </CartProvider>
            </UserProvider>
          </BrowserRouter>
        </CurrencyProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
