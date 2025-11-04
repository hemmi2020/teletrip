import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { financialApi } from '../services/financialApi';

const PaymentReconciliation = ({ showToast }) => {
  const [reconciliation, setReconciliation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReconcile = async () => {
    setLoading(true);
    try {
      const data = await financialApi.reconcilePayments();
      setReconciliation(data);
      showToast?.('Reconciliation completed', 'success');
    } catch (error) {
      showToast?.('Reconciliation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Payment Gateway Reconciliation</h3>
        <button
          onClick={handleReconcile}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Reconciling...' : 'Run Reconciliation'}
        </button>
      </div>

      {reconciliation && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <span className="font-medium">Matched</span>
              </div>
              <div className="text-2xl font-bold">{reconciliation.matched || 0}</div>
              <div className="text-sm text-gray-600">PKR {(reconciliation.matchedAmount || 0).toLocaleString()}</div>
            </div>

            <div className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="text-red-600" size={20} />
                <span className="font-medium">Unmatched</span>
              </div>
              <div className="text-2xl font-bold">{reconciliation.unmatched || 0}</div>
              <div className="text-sm text-gray-600">PKR {(reconciliation.unmatchedAmount || 0).toLocaleString()}</div>
            </div>

            <div className="border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <span className="font-medium">Pending</span>
              </div>
              <div className="text-2xl font-bold">{reconciliation.pending || 0}</div>
              <div className="text-sm text-gray-600">PKR {(reconciliation.pendingAmount || 0).toLocaleString()}</div>
            </div>
          </div>

          {reconciliation.discrepancies?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Discrepancies</h4>
              <div className="space-y-2">
                {reconciliation.discrepancies.map((disc, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 bg-red-50 p-3 text-sm">
                    <div className="font-medium">Transaction #{disc.transactionId}</div>
                    <div className="text-gray-600">{disc.reason}</div>
                    <div className="text-red-600">Difference: PKR {(disc.difference || 0).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentReconciliation;
