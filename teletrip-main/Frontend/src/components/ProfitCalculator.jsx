import React, { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

const ProfitCalculator = () => {
  const [values, setValues] = useState({
    revenue: 0,
    cost: 0,
    commission: 0,
    tax: 0,
    refunds: 0
  });

  const grossProfit = values.revenue - values.cost;
  const netProfit = grossProfit - values.commission - values.tax - values.refunds;
  const profitMargin = values.revenue > 0 ? ((netProfit / values.revenue) * 100).toFixed(2) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator size={20} />
        Profit Margin Calculator
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Revenue</label>
          <input
            type="number"
            value={values.revenue}
            onChange={(e) => setValues({ ...values, revenue: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cost</label>
          <input
            type="number"
            value={values.cost}
            onChange={(e) => setValues({ ...values, cost: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Commission</label>
          <input
            type="number"
            value={values.commission}
            onChange={(e) => setValues({ ...values, commission: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tax</label>
          <input
            type="number"
            value={values.tax}
            onChange={(e) => setValues({ ...values, tax: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Refunds</label>
          <input
            type="number"
            value={values.refunds}
            onChange={(e) => setValues({ ...values, refunds: parseFloat(e.target.value) || 0 })}
            className="w-full border rounded px-3 py-2"
            placeholder="0"
          />
        </div>
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Gross Profit:</span>
          <span className="text-xl font-bold">PKR {grossProfit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Net Profit:</span>
          <span className="text-2xl font-bold text-green-600">PKR {netProfit.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Profit Margin:</span>
          <span className="text-xl font-bold text-blue-600">{profitMargin}%</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
