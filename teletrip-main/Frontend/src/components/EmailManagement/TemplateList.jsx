import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Edit, Copy, Trash2, Send, Plus, RefreshCw,
  ChevronLeft, ChevronRight, Loader2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { EmailManagementAPI } from '../../services/emailApi';
import TemplateEditor from './TemplateEditor';

const CATEGORIES = ['booking', 'payment', 'account', 'support', 'marketing', 'system'];

const categoryColors = {
  booking: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  account: 'bg-purple-100 text-purple-800',
  support: 'bg-yellow-100 text-yellow-800',
  marketing: 'bg-pink-100 text-pink-800',
  system: 'bg-gray-100 text-gray-800',
};

const TemplateList = ({ showToast }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const limit = 10;

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    const result = await EmailManagementAPI.listTemplates({
      page,
      limit,
      search: search || undefined,
      category: categoryFilter || undefined,
    });
    if (result.success) {
      setTemplates(result.data.docs || result.data.templates || []);
      setTotalPages(result.data.totalPages || 1);
      setTotalDocs(result.data.totalDocs || 0);
    } else {
      showToast?.(result.error, 'error');
    }
    setLoading(false);
  }, [page, search, categoryFilter, showToast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleToggleActive = async (template) => {
    const result = await EmailManagementAPI.updateTemplate(template._id, {
      isActive: !template.isActive,
    });
    if (result.success) {
      showToast?.(`Template ${result.data.isActive ? 'activated' : 'deactivated'}`, 'success');
      loadTemplates();
    } else {
      showToast?.(result.error, 'error');
    }
  };

  const handleDuplicate = async (template) => {
    const newSlug = prompt('Enter a slug for the duplicate:', `${template.slug}_copy`);
    if (!newSlug) return;
    const result = await EmailManagementAPI.duplicateTemplate(template._id, newSlug);
    if (result.success) {
      showToast?.('Template duplicated', 'success');
      loadTemplates();
    } else {
      showToast?.(result.error, 'error');
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete template "${template.name}"? ${template.isDefault ? 'This is a default template and will be soft-deleted.' : ''}`)) return;
    const result = await EmailManagementAPI.deleteTemplate(template._id);
    if (result.success) {
      showToast?.('Template deleted', 'success');
      loadTemplates();
    } else {
      showToast?.(result.error, 'error');
    }
  };

  const handleSendTest = async (template) => {
    const result = await EmailManagementAPI.sendTestEmail(template._id, template.sampleData || {});
    if (result.success) {
      showToast?.('Test email sent to your address', 'success');
    } else {
      showToast?.(result.error, 'error');
    }
  };

  // If editing a template, show the editor
  if (editingTemplateId) {
    return (
      <TemplateEditor
        templateId={editingTemplateId}
        onClose={() => {
          setEditingTemplateId(null);
          loadTemplates();
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {/* Category filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadTemplates}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Send Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sent</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((tpl) => (
                  <tr key={tpl._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tpl.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{tpl.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[tpl.category] || 'bg-gray-100 text-gray-800'}`}>
                        {tpl.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(tpl)}
                        className="focus:outline-none"
                        title={tpl.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {tpl.isActive ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {tpl.metadata?.sendCount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tpl.metadata?.lastSentAt
                        ? new Date(tpl.metadata.lastSentAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTemplateId(tpl._id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(tpl)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendTest(tpl)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Send Test"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tpl)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalDocs)} of {totalDocs} templates
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateList;
