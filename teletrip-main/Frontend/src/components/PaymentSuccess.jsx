import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserDataContext, useCart } from './CartSystem';
import Header from './Header';
import Footer from './Footer';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Home,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Receipt,
  ArrowRight,
  Share2,
  Printer,
  Copy,
  RefreshCw
} from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useContext(UserDataContext);
  const { clearCart } = useCart();
  
  const [paymentData, setPaymentData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('\n🎯 ========== PAYMENT SUCCESS PAGE ==========');
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 All URL Parameters:', Object.fromEntries(searchParams));

    // Enhanced parameter extraction to handle HBL response format
    const extractHBLParameters = () => {
      const params = {};
      
      // HBL standard parameters (from your successful decryption)
      params.responseCode = searchParams.get('RESPONSE_CODE') || searchParams.get('code') || null;
      params.responseMessage = searchParams.get('RESPONSE_MESSAGE') || searchParams.get('message') || null;
      params.orderRefNumber = searchParams.get('ORDER_REF_NUMBER') || searchParams.get('orderId') || searchParams.get('ref') || null;
      params.paymentType = searchParams.get('PAYMENT_TYPE') || searchParams.get('type') || null;
      params.cardMasked = searchParams.get('CARD_NUM_MASKED') || searchParams.get('card') || null;
      params.transactionId = searchParams.get('GUID') || searchParams.get('transactionId') || searchParams.get('TRANSACTION_ID') || null;
      params.discountedAmount = searchParams.get('DISCOUNTED_AMOUNT') || '0';
      params.discountCampaignId = searchParams.get('DISCOUNT_CAMPAIGN_ID') || '0';
      
      // Additional standard parameters
      params.amount = searchParams.get('amount') || '0';
      params.currency = searchParams.get('currency') || 'PKR';
      params.status = searchParams.get('status') || null;
      
      // Raw encrypted data (for debugging)
      params.rawData = searchParams.get('data') || null;
      
      return params;
    };

    const extractedParams = extractHBLParameters();
    
    console.log('📊 Extracted Parameters:', extractedParams);
    
    // Determine actual success status based on HBL response codes
    // According to HBL docs: 0 = success, 100 = success, others = failed
    const responseCode = extractedParams.responseCode;
    const isActuallySuccessful = responseCode === '0' || responseCode === '100' || responseCode === 0 || responseCode === 100;
    
    // Enhanced payment data object
    const processedPaymentData = {
      // Status determination
      isSuccess: isActuallySuccessful,
      status: isActuallySuccessful ? 'success' : (responseCode ? 'failed' : 'pending'),
      
      // HBL Response Data
      responseCode: responseCode,
      responseMessage: extractedParams.responseMessage || (isActuallySuccessful ? 'Transaction completed successfully' : 'Transaction failed'),
      orderRefNumber: extractedParams.orderRefNumber,
      paymentType: extractedParams.paymentType || 'Credit/Debit Card',
      cardMasked: extractedParams.cardMasked,
      transactionId: extractedParams.transactionId,
      
      // Transaction Details
      amount: extractedParams.amount,
      currency: extractedParams.currency,
      discountedAmount: extractedParams.discountedAmount,
      discountCampaignId: extractedParams.discountCampaignId,
      
      // Metadata
      timestamp: new Date().toISOString(),
      rawData: extractedParams.rawData,
      
      // Derived fields
      displayAmount: `${extractedParams.currency} ${extractedParams.amount}`,
      paymentMethod: extractedParams.paymentType || 'Credit/Debit Card'
    };
    
    console.log('🎊 Final Payment Data:', processedPaymentData);
    console.log('✅ Transaction Status:', processedPaymentData.status);
    console.log('🔍 Success Determination:', {
      responseCode: responseCode,
      isSuccess: isActuallySuccessful,
      logic: 'responseCode === "0" || responseCode === "100"'
    });
    
    setPaymentData(processedPaymentData);
    setIsLoading(false);

    // Clear cart on successful payment
    if (processedPaymentData.isSuccess && processedPaymentData.orderRefNumber) {
      clearCart();
      console.log('🛒 Cart cleared after successful payment');
    }

  }, [searchParams, clearCart]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoToDashboard = () => {
    navigate('/account');
  };

  const handleRetry = () => {
    navigate('/checkout');
  };

  const handleDownloadReceipt = () => {
    // Create a simple receipt text
    const receiptText = `
TELITRIP PAYMENT RECEIPT
========================
Transaction ID: ${paymentData.transactionId || 'N/A'}
Order Reference: ${paymentData.orderRefNumber || 'N/A'}
Amount: ${paymentData.displayAmount}
Payment Method: ${paymentData.paymentMethod}
Status: ${paymentData.status}
Date: ${new Date(paymentData.timestamp).toLocaleString()}
Response Code: ${paymentData.responseCode || 'N/A'}
`;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `receipt-${paymentData.orderRefNumber || 'payment'}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing payment result...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine display elements based on status
  const isSuccess = paymentData.isSuccess;
  const statusColor = isSuccess ? 'green' : (paymentData.responseCode ? 'red' : 'yellow');
  const StatusIcon = isSuccess ? CheckCircle : (paymentData.responseCode ? XCircle : AlertCircle);
  const statusTitle = isSuccess ? 'Payment Successful!' : 
                     paymentData.responseCode ? 'Payment Failed' : 
                     'Payment Status Update';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-${statusColor}-100 rounded-full mb-4`}>
            <StatusIcon className={`w-8 h-8 text-${statusColor}-600`} />
          </div>
          <h1 className={`text-3xl font-bold text-gray-900 mb-2`}>
            {statusTitle}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {paymentData.responseMessage}
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className={`px-6 py-4 bg-${statusColor}-50 border-b`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction Details
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusColor}-100 text-${statusColor}-800`}>
                Code: {paymentData.responseCode || 'N/A'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-4">
            {/* Row 1: Order & Transaction ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Receipt className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Order Number</p>
                  <p className="text-lg font-mono text-gray-900 break-all">
                    {paymentData.orderRefNumber || 'N/A'}
                  </p>
                  {paymentData.orderRefNumber && (
                    <button
                      onClick={() => copyToClipboard(paymentData.orderRefNumber)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                  <p className="text-lg font-mono text-gray-900 break-all">
                    {paymentData.transactionId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Payment Method & Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="text-lg text-gray-900">
                    {paymentData.paymentMethod}
                  </p>
                  {paymentData.cardMasked && (
                    <p className="text-sm text-gray-500">
                      {paymentData.cardMasked}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-gray-400 mt-1 flex items-center justify-center text-sm font-bold">₨</div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="text-lg font-bold text-gray-900">
                    {paymentData.displayAmount}
                  </p>
                  {paymentData.discountedAmount !== '0' && (
                    <p className="text-sm text-green-600">
                      Discount: {paymentData.currency} {paymentData.discountedAmount}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Timestamp */}
            <div className="pt-4 border-t">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Transaction Time</p>
                  <p className="text-lg text-gray-900">
                    {new Date(paymentData.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGoHome}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-${statusColor}-600 text-white rounded-lg hover:bg-${statusColor}-700 transition-colors`}
          >
            <Home className="w-5 h-5" />
            <span>Go to Home</span>
          </button>

          {isSuccess && (
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download Receipt</span>
            </button>
          )}

          {!isSuccess && paymentData.responseCode && (
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        {/* Debug Info (only show in development) */}
        {import.meta.env.MODE === 'development' && (
          <div className="max-w-2xl mx-auto mt-8 bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Debug Information</h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(paymentData, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;