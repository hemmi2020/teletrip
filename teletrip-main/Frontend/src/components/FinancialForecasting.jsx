import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { financialApi } from '../services/financialApi';

const FinancialForecasting = ({ showToast }) => {
  const [forecast, setForecast] = useState(null);
  const [period, setPeriod] = useState('3months');

  useEffect(() => {
    loadForecast();
  }, [period]);

  const loadForecast = async () => {
    try {
      const data = await financialApi.getForecast(period);
      setForecast(data);
    } catch (error) {
      showToast?.('Failed to load forecast', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={20} />
          Financial Forecasting
        </h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="1month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="1year">1 Year</option>
        </select>
      </div>

      {forecast && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 rounded p-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">Projected Revenue</div>
              <div className="text-xl font-bold">PKR {(forecast.projectedRevenue || 0).toLocaleString()}</div>
              <div className="text-xs text-green-600">+{forecast.revenueGrowth || 0}%</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 rounded p-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">Projected Profit</div>
              <div className="text-xl font-bold">PKR {(forecast.projectedProfit || 0).toLocaleString()}</div>
              <div className="text-xs text-green-600">+{forecast.profitGrowth || 0}%</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 rounded p-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">Confidence</div>
              <div className="text-xl font-bold">{forecast.confidence || 0}%</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecast.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeDasharray="5 5" name="Forecast" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 text-sm text-gray-600">
            <p>Based on historical data and current trends. Forecast accuracy: {forecast.confidence || 0}%</p>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialForecasting;
