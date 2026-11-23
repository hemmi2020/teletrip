import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tag, Plus, Search, RefreshCw, Trash2, Edit2, 
  CheckCircle, XCircle, AlertCircle, Copy, Check, 
  Calendar, DollarSign, Percent, Clock, X, Save
} from 'lucide-react';
import { AdminDashboardAPI, formatDate, formatDateTime } from '../../services/adminApi';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Coupons' },
  { id: 'active', label: 'Active & Valid' },
  { id: 'expired', label: 'Expired' },
  { id: 'inactive', label: 'Disabled' }
];

export default function FullWidthCouponsTable({ showToast }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minBookingAmount: 0,
    maxDiscountAmount: '',
    currency: 'USD',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
    applicableDestinations: '',
    isActive: true
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: search.trim() || undefined
      };
      const result = await AdminDashboardAPI.getCoupons(params);
      if (result.success && result.data) {
        setCoupons(result.data.coupons || []);
      } else {
        showToast?.('error', result.error || 'Failed to fetch coupons');
      }
    } catch (err) {
      showToast?.('error', 'Error loading coupons');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, search, showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || 10,
        minBookingAmount: coupon.minBookingAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        currency: coupon.currency || 'USD',
        validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
        usageLimit: coupon.usageLimit || 100,
        applicableDestinations: Array.isArray(coupon.applicableDestinations) ? coupon.applicableDestinations.join(', ') : '',
        isActive: coupon.isActive !== false
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minBookingAmount: 0,
        maxDiscountAmount: '',
        currency: 'USD',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 100,
        applicableDestinations: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleToggle = async (id) => {
    try {
      const result = await AdminDashboardAPI.toggleCoupon(id);
      if (result.success) {
        showToast?.('success', 'Coupon status updated');
        fetchCoupons();
      } else {
        showToast?.('error', result.error || 'Failed to toggle status');
      }
    } catch (err) {
      showToast?.('error', 'Error updating coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;
    try {
      const result = await AdminDashboardAPI.deleteCoupon(id);
      if (result.success) {
        showToast?.('success', 'Coupon deleted');
        fetchCoupons();
      } else {
        showToast?.('error', result.error || 'Failed to delete coupon');
      }
    } catch (err) {
      showToast?.('error', 'Error deleting coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast?.('error', 'Please enter a coupon code');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        applicableDestinations: formData.applicableDestinations
          ? formData.applicableDestinations.split(',').map((d) => d.trim()).filter(Boolean)
          : []
      };

      let result;
      if (editingCoupon) {
        result = await AdminDashboardAPI.updateCoupon(editingCoupon._id, payload);
      } else {
        result = await AdminDashboardAPI.createCoupon(payload);
      }

      if (result.success) {
        showToast?.('success', editingCoupon ? 'Coupon updated' : 'Coupon created');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        showToast?.('error', result.error || 'Failed to save coupon');
      }
    } catch (err) {
      showToast?.('error', 'Error saving coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Promo Codes & Discount Coupons
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create promotional discount vouchers, set minimum booking thresholds, and manage usage limits.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCoupons}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Coupon
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStatus === s.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Conditions & Caps</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Usage Meter</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
                    Loading promo coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No coupons found. Click "Create Coupon" to launch a campaign.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.validUntil) < new Date();
                  const usagePercent = Math.min(100, Math.round(((coupon.usedCount || 0) / (coupon.usageLimit || 1)) * 100));

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Code */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="p-1 text-gray-400 hover:text-purple-600 rounded transition"
                            title="Copy Code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <div className="text-[11px] text-gray-400 mt-1 max-w-xs truncate">{coupon.description}</div>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-700 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                        </span>
                      </td>

                      {/* Conditions */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-[11px] space-y-0.5">
                          <div>
                            Min Spend: <span className="font-semibold text-gray-800">${coupon.minBookingAmount || 0}</span>
                          </div>
                          {coupon.maxDiscountAmount ? (
                            <div className="text-gray-500">
                              Max Cap: <span className="font-semibold text-gray-800">${coupon.maxDiscountAmount}</span>
                            </div>
                          ) : (
                            <div className="text-gray-400 italic">No cap</div>
                          )}
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(coupon.validFrom)} – {formatDate(coupon.validUntil)}</span>
                        </div>
                        {isExpired && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Expired
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[11px] text-gray-600 font-medium">
                            <span>{coupon.usedCount || 0} used</span>
                            <span className="text-gray-400">/ {coupon.usageLimit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercent >= 90 ? 'bg-red-500' : 'bg-purple-600'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(coupon._id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                            coupon.isActive && !isExpired
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {coupon.isActive && !isExpired ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-gray-400" /> Disabled
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(coupon)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id, coupon.code)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  {editingCoupon ? 'Edit Promo Coupon' : 'Create Promo Code'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Coupon Code (Uppercase) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER25"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Fixed Amount Off ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Campaign Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for first-time summer vacation bookers"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Value ({formData.discountType === 'percentage' ? '%' : '$'}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Cap ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Valid Until (Expiry) *</label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Total Usage Limit (Total redemptions)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Destination Restriction (Optional, comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai, London, Istanbul (Leave blank for all)"
                  value={formData.applicableDestinations}
                  onChange={(e) => setFormData({ ...formData, applicableDestinations: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCouponToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <label htmlFor="isActiveCouponToggle" className="font-semibold text-gray-700 cursor-pointer">
                  Coupon is active and redeemable immediately
                </label>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50 -mx-6 -mb-6 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
