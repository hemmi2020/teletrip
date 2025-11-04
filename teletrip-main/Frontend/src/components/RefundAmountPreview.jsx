import { useState } from 'react';
import { DollarSign, TrendingDown, CheckCircle, XCircle } from 'lucide-react';

const RefundAmountPreview = ({ booking, onConfirm }) => {
  const [customAmount, setCustomAmount] = useState('');
  const [refundType, setRefundType] = useState('full');

  const calculateRefund = () => {
    const total = booking?.totalAmount || 0;
    
    switch (refundType) {
      case 'full':
        return total;
      case 'partial':
        return total * 0.5;
      case 'custom':
        return parseFloat(customAmount) || 0;
      default:
        return 0;
    }
  };

  const refundAmount = calculateRefund();
  const processingFee = refundAmount * 0.03;
  const netRefund = refundAmount - processingFee;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <DollarSign className="w-6 h-6 text-green-600 mr-2" />
        <h3 className="text-xl font-bold">Refund Amount Preview</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Original Booking Amount</p>
          <p className="text-3xl font-bold text-gray-900">
            €{(booking?.totalAmount || 0).toFixed(2)}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Refund Type</label>
          
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="refundType"
                value="full"
                checked={refundType === 'full'}
                onChange={(e) => setRefundType(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">Full Refund</p>
                <p className="text-sm text-gray-600">100% of booking amount</p>
              </div>
              <p className="font-bold text-green-600">€{(booking?.totalAmount || 0).toFixed(2)}</p>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="refundType"
                value="partial"
                checked={refundType === 'partial'}
                onChange={(e) => setRefundType(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">Partial Refund</p>
                <p className="text-sm text-gray-600">50% of booking amount</p>
              </div>
              <p className="font-bold text-blue-600">€{((booking?.totalAmount || 0) * 0.5).toFixed(2)}</p>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="refundType"
                value="custom"
                checked={refundType === 'custom'}
                onChange={(e) => setRefundType(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">Custom Amount</p>
                <p className="text-sm text-gray-600">Specify custom refund</p>
              </div>
            </label>
          </div>

          {refundType === 'custom' && (
            <input
              type="number"
              min="0"
              max={booking?.totalAmount || 0}
              step="0.01"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Refund Amount</span>
            <span className="font-medium">€{refundAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 flex items-center">
              Processing Fee (3%)
              <TrendingDown className="w-3 h-3 ml-1 text-red-500" />
            </span>
            <span className="font-medium text-red-600">-€{processingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Net Refund</span>
            <span className="text-green-600">€{netRefund.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onConfirm?.(netRefund)}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Refund
          </button>
          <button
            className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundAmountPreview;
