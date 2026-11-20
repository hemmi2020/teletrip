import React, { useState } from 'react';
import { FileText, TrendingUp, Users, Calendar, Download } from 'lucide-react';
import { reportApi } from '../services/reportApi';
import { generateRevenuePDF, generateUserActivityPDF, generateBookingAnalyticsPDF, generateInvoicePDF } from '../utils/pdfGenerator';

const QuickReports = ({ showToast, bookings }) => {
  const [loading, setLoading] = useState(false);

  const getLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const handleRevenueReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getLast30Days();
      const data = await reportApi.getRevenueReport(startDate, endDate);
      const pdf = generateRevenuePDF(data, startDate, endDate);
      pdf.save(`revenue-report-${Date.now()}.pdf`);
      showToast?.('Revenue report generated', 'success');
    } catch (error) {
      showToast?.('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUserActivityReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getLast30Days();
      const data = await reportApi.getUserActivityReport(startDate, endDate);
      const pdf = generateUserActivityPDF(data, startDate, endDate);
      pdf.save(`user-activity-${Date.now()}.pdf`);
      showToast?.('User activity report generated', 'success');
    } catch (error) {
      showToast?.('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAnalytics = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getLast30Days();
      const data = await reportApi.getBookingAnalyticsReport(startDate, endDate);
      const pdf = generateBookingAnalyticsPDF(data, startDate, endDate);
      pdf.save(`booking-analytics-${Date.now()}.pdf`);
      showToast?.('Booking analytics generated', 'success');
    } catch (error) {
      showToast?.('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceGeneration = (booking) => {
    try {
      const pdf = generateInvoicePDF(booking);
      pdf.save(`invoice-${booking.id}.pdf`);
      showToast?.('Invoice generated', 'success');
    } catch (error) {
      showToast?.('Failed to generate invoice', 'error');
    }
  };

  const quickReports = [
    {
      title: 'Revenue Report',
      description: 'Last 30 days revenue analysis',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      action: handleRevenueReport
    },
    {
      title: 'User Activity',
      description: 'User engagement metrics',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      action: handleUserActivityReport
    },
    {
      title: 'Booking Analytics',
      description: 'Booking trends and insights',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      action: handleBookingAnalytics
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Quick Reports
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quickReports.map((report, index) => (
          <button
            key={index}
            onClick={report.action}
            disabled={loading}
            className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl hover:shadow-sm transition-all text-left disabled:opacity-50 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl ${report.color} flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform`}>
              <report.icon size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-900 mb-1">{report.title}</h4>
            <p className="text-xs text-slate-500">{report.description}</p>
          </button>
        ))}
      </div>

      {bookings && bookings.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Download Booking Invoices</h4>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {bookings.slice(0, 10).map((booking) => {
              const bRef = booking.bookingReference || booking._id?.slice(-8) || booking.id || 'N/A';
              const guest = booking.guestName || (booking.user?.fullname ? `${booking.user.fullname.firstname || ''} ${booking.user.fullname.lastname || ''}`.trim() : (booking.user?.email || 'Guest'));
              const amount = booking.totalPrice || booking.amount || booking.finalAmount || 0;
              const currency = booking.currency || 'AED';

              return (
                <div key={booking._id || booking.id} className="flex justify-between items-center p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-900">PNR: {bRef}</p>
                    <p className="text-xs text-slate-500">{guest} · {currency} {Number(amount).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleInvoiceGeneration(booking)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    Invoice
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickReports;
