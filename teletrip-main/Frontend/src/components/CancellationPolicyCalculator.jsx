import { useState, useEffect } from 'react';
import { Calculator, AlertCircle, Calendar } from 'lucide-react';

const CancellationPolicyCalculator = ({ booking }) => {
  const [refundAmount, setRefundAmount] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [policyDetails, setPolicyDetails] = useState(null);

  useEffect(() => {
    calculateRefund();
  }, [booking]);

  const calculateRefund = () => {
    if (!booking) return;

    const checkInDate = new Date(booking.checkIn);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    const totalAmount = booking.totalAmount || 0;

    let refundPercentage = 0;
    let penaltyPercentage = 0;
    let policyType = '';

    if (daysUntilCheckIn >= 30) {
      refundPercentage = 100;
      penaltyPercentage = 0;
      policyType = 'Full Refund';
    } else if (daysUntilCheckIn >= 14) {
      refundPercentage = 75;
      penaltyPercentage = 25;
      policyType = '75% Refund';
    } else if (daysUntilCheckIn >= 7) {
      refundPercentage = 50;
      penaltyPercentage = 50;
      policyType = '50% Refund';
    } else if (daysUntilCheckIn >= 3) {
      refundPercentage = 25;
      penaltyPercentage = 75;
      policyType = '25% Refund';
    } else {
      refundPercentage = 0;
      penaltyPercentage = 100;
      policyType = 'No Refund';
    }

    const calculatedRefund = (totalAmount * refundPercentage) / 100;
    const calculatedPenalty = (totalAmount * penaltyPercentage) / 100;

    setRefundAmount(calculatedRefund);
    setPenalty(calculatedPenalty);
    setPolicyDetails({
      daysUntilCheckIn,
      refundPercentage,
      penaltyPercentage,
      policyType
    });
  };

  if (!booking) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-bold">Cancellation Policy Calculator</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">{policyDetails?.policyType}</p>
              <p className="text-sm text-blue-700 mt-1">
                {policyDetails?.daysUntilCheckIn} days until check-in
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Original Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              €{(booking.totalAmount || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600 mb-1">Cancellation Penalty</p>
            <p className="text-2xl font-bold text-red-600">
              -€{penalty.toFixed(2)}
            </p>
            <p className="text-xs text-red-500 mt-1">
              ({policyDetails?.penaltyPercentage}%)
            </p>
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">Refund Amount</p>
          <p className="text-3xl font-bold text-green-600">
            €{refundAmount.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            ({policyDetails?.refundPercentage}% of total)
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Cancellation Policy Tiers</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">30+ days before</span>
              <span className="font-medium text-green-600">100% refund</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">14-29 days before</span>
              <span className="font-medium text-blue-600">75% refund</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">7-13 days before</span>
              <span className="font-medium text-yellow-600">50% refund</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">3-6 days before</span>
              <span className="font-medium text-orange-600">25% refund</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-600">Less than 3 days</span>
              <span className="font-medium text-red-600">No refund</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicyCalculator;
