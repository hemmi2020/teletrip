import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (booking) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('TeleTrip Travel Services', 20, 35);
  doc.text(`Invoice #: ${booking.id || 'N/A'}`, 20, 45);
  doc.text(`Date: ${new Date(booking.createdAt || Date.now()).toLocaleDateString()}`, 20, 50);
  
  doc.text('Bill To:', 20, 65);
  doc.text(booking.userName || 'Customer', 20, 70);
  doc.text(booking.userEmail || '', 20, 75);
  
  doc.autoTable({
    startY: 90,
    head: [['Description', 'Quantity', 'Price', 'Total']],
    body: [[booking.type || 'Booking', '1', `$${booking.amount || 0}`, `$${booking.amount || 0}`]],
    theme: 'grid'
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Total: $${booking.amount || 0}`, 150, finalY);
  
  return doc;
};

export const generateRevenuePDF = (data, startDate, endDate) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Revenue Report', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Period: ${startDate} to ${endDate}`, 105, 30, { align: 'center' });
  
  doc.text(`Total Revenue: $${data.totalRevenue || 0}`, 20, 45);
  doc.text(`Total Bookings: ${data.totalBookings || 0}`, 20, 52);
  doc.text(`Average Order Value: $${data.avgOrderValue || 0}`, 20, 59);
  
  if (data.byType && data.byType.length > 0) {
    doc.autoTable({
      startY: 70,
      head: [['Type', 'Count', 'Revenue']],
      body: data.byType.map(item => [item.type, item.count, `$${item.revenue}`]),
      theme: 'striped'
    });
  }
  
  return doc;
};

export const generateUserActivityPDF = (data, startDate, endDate) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('User Activity Report', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Period: ${startDate} to ${endDate}`, 105, 30, { align: 'center' });
  
  doc.text(`Total Users: ${data.totalUsers || 0}`, 20, 45);
  doc.text(`Active Users: ${data.activeUsers || 0}`, 20, 52);
  doc.text(`New Registrations: ${data.newUsers || 0}`, 20, 59);
  
  if (data.activities && data.activities.length > 0) {
    doc.autoTable({
      startY: 70,
      head: [['User', 'Action', 'Date']],
      body: data.activities.map(a => [a.userName, a.action, new Date(a.date).toLocaleString()]),
      theme: 'striped'
    });
  }
  
  return doc;
};

export const generateBookingAnalyticsPDF = (data, startDate, endDate) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Booking Analytics Report', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Period: ${startDate} to ${endDate}`, 105, 30, { align: 'center' });
  
  doc.text(`Total Bookings: ${data.totalBookings || 0}`, 20, 45);
  doc.text(`Confirmed: ${data.confirmed || 0}`, 20, 52);
  doc.text(`Pending: ${data.pending || 0}`, 20, 59);
  doc.text(`Cancelled: ${data.cancelled || 0}`, 20, 66);
  
  if (data.topDestinations && data.topDestinations.length > 0) {
    doc.autoTable({
      startY: 80,
      head: [['Destination', 'Bookings', 'Revenue']],
      body: data.topDestinations.map(d => [d.name, d.count, `$${d.revenue}`]),
      theme: 'striped'
    });
  }
  
  return doc;
};
