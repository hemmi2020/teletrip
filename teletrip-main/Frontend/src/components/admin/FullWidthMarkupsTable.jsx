import React, { useState, useEffect, useCallback } from 'react';
import { 
  Percent, Plus, Search, RefreshCw, Trash2, Edit2, 
  CheckCircle, XCircle, AlertCircle, TrendingUp, DollarSign, 
  MapPin, Hotel, Star, Globe, X, Save
} from 'lucide-react';
import { AdminDashboardAPI, formatDateTime } from '../../services/adminApi';

const RULE_TYPES = [
  { id: 'all', label: 'All Rules' },
  { id: 'global', label: 'Global Default' },
  { id: 'destination', label: 'By Destination' },
  { id: 'hotel', label: 'By Specific Hotel' },
  { id: 'star_rating', label: 'By Star Rating' }
];

export default function FullWidthMarkupsTable({ showToast }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'global',
    targetDestination: '',
    targetHotelId: '',
    targetStarRating: 5,
    calculationType: 'percentage',
    markupValue: 10,
    currency: 'USD',
    priority: 0,
    isActive: true
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ruleType: selectedType !== 'all' ? selectedType : undefined,
        search: search.trim() || undefined
      };
      const result = await AdminDashboardAPI.getMarkups(params);
      if (result.success && result.data) {
        setRules(result.data.rules || []);
      } else {
        showToast?.('error', result.error || 'Failed to fetch markup rules');
      }
    } catch (err) {
      showToast?.('error', 'Error loading markup rules');
    } finally {
      setLoading(false);
    }
  }, [selectedType, search, showToast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        ruleType: rule.ruleType || 'global',
        targetDestination: rule.targetDestination || '',
        targetHotelId: rule.targetHotelId || '',
        targetStarRating: rule.targetStarRating || 5,
        calculationType: rule.calculationType || 'percentage',
        markupValue: rule.markupValue || 10,
        currency: rule.currency || 'USD',
        priority: rule.priority || 0,
        isActive: rule.isActive !== false
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        description: '',
        ruleType: 'global',
        targetDestination: '',
        targetHotelId: '',
        targetStarRating: 5,
        calculationType: 'percentage',
        markupValue: 10,
        currency: 'USD',
        priority: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleToggle = async (id) => {
    try {
      const result = await AdminDashboardAPI.toggleMarkup(id);
      if (result.success) {
        showToast?.('success', 'Rule status updated');
        fetchRules();
      } else {
        showToast?.('error', result.error || 'Failed to toggle status');
      }
    } catch (err) {
      showToast?.('error', 'Error updating rule status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete markup rule "${name}"?`)) return;
    try {
      const result = await AdminDashboardAPI.deleteMarkup(id);
      if (result.success) {
        showToast?.('success', 'Markup rule deleted');
        fetchRules();
      } else {
        showToast?.('error', result.error || 'Failed to delete rule');
      }
    } catch (err) {
      showToast?.('error', 'Error deleting rule');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast?.('error', 'Please enter a rule name');
      return;
    }
    setSubmitting(true);
    try {
      let result;
      if (editingRule) {
        result = await AdminDashboardAPI.updateMarkup(editingRule._id, formData);
      } else {
        result = await AdminDashboardAPI.createMarkup(formData);
      }

      if (result.success) {
        showToast?.('success', editingRule ? 'Markup rule updated' : 'Markup rule created');
        setIsModalOpen(false);
        fetchRules();
      } else {
        showToast?.('error', result.error || 'Failed to save markup rule');
      }
    } catch (err) {
      showToast?.('error', 'Error saving rule');
    } finally {
      setSubmitting(false);
    }
  };

  // Preview Example calculation
  const sampleWholesale = 100;
  const sampleMarkup = formData.calculationType === 'percentage' 
    ? (sampleWholesale * Number(formData.markupValue || 0)) / 100 
    : Number(formData.markupValue || 0);
  const sampleRetail = sampleWholesale + sampleMarkup;

  return (
    <div className="w-full space-y-4">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Markup & Commission Rules Engine
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure profit margins and pricing markups applied automatically to supplier wholesale rates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchRules}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Markup Rule
            </button>
          </div>
        </div>

        {/* Rule Type Filter Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none flex-1">
            {RULE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedType === t.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by rule name, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Target Scope</th>
                <th className="py-3 px-4">Markup Value</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading markup rules...
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Percent className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No markup rules created yet. Click "Add Markup Rule" to get started.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900 text-xs">{rule.name}</div>
                      {rule.description && (
                        <div className="text-[11px] text-gray-400 max-w-xs truncate">{rule.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rule.ruleType === 'global' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Globe className="w-3 h-3" /> Global (All Inventory)
                        </span>
                      )}
                      {rule.ruleType === 'destination' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <MapPin className="w-3 h-3" /> {rule.targetDestination || 'Destination'}
                        </span>
                      )}
                      {rule.ruleType === 'hotel' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Hotel className="w-3 h-3" /> Hotel ID: {rule.targetHotelId || 'Specific'}
                        </span>
                      )}
                      {rule.ruleType === 'star_rating' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> {rule.targetStarRating} Stars
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-emerald-700 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {rule.calculationType === 'percentage' ? `+${rule.markupValue}%` : `+$${rule.markupValue} ${rule.currency}`}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        Priority: {rule.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(rule._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                          rule.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {rule.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-400" /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                      {formatDateTime(rule.updatedAt || rule.createdAt)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(rule)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Rule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule._id, rule.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-base">
                  {editingRule ? 'Edit Markup Rule' : 'Create Pricing Markup Rule'}
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
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 12% Hotel Margin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description (Internal)</label>
                <input
                  type="text"
                  placeholder="e.g. Applied across all Bedsonline inventory by default"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Scope / Rule Type</label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="global">Global Default (All)</option>
                    <option value="destination">By Destination Name</option>
                    <option value="hotel">By Specific Hotel ID</option>
                    <option value="star_rating">By Star Rating</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Calculation Method</label>
                  <select
                    value={formData.calculationType}
                    onChange={(e) => setFormData({ ...formData, calculationType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="percentage">Percentage Markup (%)</option>
                    <option value="fixed_amount">Fixed Amount Markup ($)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Target Inputs */}
              {formData.ruleType === 'destination' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Destination (City / Country)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dubai, DXB, Paris, London"
                    value={formData.targetDestination}
                    onChange={(e) => setFormData({ ...formData, targetDestination: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {formData.ruleType === 'hotel' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Hotel Supplier Code / ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HBX-10492"
                    value={formData.targetHotelId}
                    onChange={(e) => setFormData({ ...formData, targetHotelId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {formData.ruleType === 'star_rating' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Star Rating</label>
                  <select
                    value={formData.targetStarRating}
                    onChange={(e) => setFormData({ ...formData, targetStarRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value={5}>5 Stars Luxury</option>
                    <option value={4}>4 Stars Premium</option>
                    <option value={3}>3 Stars Standard</option>
                    <option value={2}>2 Stars Budget</option>
                    <option value={1}>1 Star Basic</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Markup Value ({formData.calculationType === 'percentage' ? '%' : '$'}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.markupValue}
                    onChange={(e) => setFormData({ ...formData, markupValue: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority Order (Higher = Evaluated First)</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 block text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  Live Calculation Preview:
                </span>
                <p className="text-emerald-800 text-[11px]">
                  If supplier wholesale rate is <strong>${sampleWholesale}.00</strong> → Markup is <strong>+${sampleMarkup.toFixed(2)}</strong> → Final customer rate is <strong className="text-emerald-950">${sampleRetail.toFixed(2)}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="isActiveToggle" className="font-semibold text-gray-700 cursor-pointer">
                  Rule is active and taking effect immediately
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
