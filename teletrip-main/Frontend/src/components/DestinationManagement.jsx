import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus, Edit, Trash2, GripVertical, CheckCircle, XCircle,
  AlertCircle, X, Loader2, Image as ImageIcon
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_BASE_URL || 'http://localhost:3000') + '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const INITIAL_FORM = {
  name: '',
  country: '',
  image: '',
  heroImage: '',
  gallery: '',
  tag: '',
  description: '',
  longDescription: '',
  highlights: '',
  seo: { metaTitle: '', metaDescription: '', ogImage: '' },
  continent: '',
  isFeatured: false,
  isActive: true,
  order: 0
};

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'];

const DestinationManagement = ({ showToast }) => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const toast = useCallback((message, type = 'success') => {
    if (showToast) showToast(message, type);
  }, [showToast]);

  // Fetch all destinations (admin endpoint)
  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/destinations/admin`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data || []);
      } else {
        toast(data.message || 'Failed to load destinations', 'error');
      }
    } catch {
      toast('Failed to load destinations', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  // Seed sample destinations
  const SAMPLE_DESTINATIONS = [
    { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', tag: 'Popular', description: 'The City of Light, famous for the Eiffel Tower, world-class cuisine, and romantic ambiance.', continent: 'Europe', isFeatured: true, isActive: true, order: 0 },
    { name: 'Bali', country: 'Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', tag: 'Tropical', description: 'A tropical paradise known for stunning beaches, lush rice terraces, and vibrant culture.', continent: 'Asia', isFeatured: true, isActive: true, order: 1 },
    { name: 'New York', country: 'United States', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', tag: 'City', description: 'The city that never sleeps, home to iconic landmarks, Broadway, and diverse neighborhoods.', continent: 'North America', isFeatured: true, isActive: true, order: 2 },
    { name: 'Dubai', country: 'United Arab Emirates', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', tag: 'Luxury', description: 'A futuristic metropolis with stunning architecture, luxury shopping, and desert adventures.', continent: 'Asia', isFeatured: true, isActive: true, order: 3 },
    { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', tag: 'Culture', description: 'A fascinating blend of ancient traditions and cutting-edge technology in Japan\'s capital.', continent: 'Asia', isFeatured: false, isActive: true, order: 4 }
  ];

  const handleSeedDestinations = async () => {
    setSeeding(true);
    let created = 0;
    let skipped = 0;

    for (const dest of SAMPLE_DESTINATIONS) {
      try {
        const res = await fetch(`${API_BASE}/destinations`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(dest)
        });
        const data = await res.json();
        if (data.success) {
          created++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    toast(`Sample destinations seeded: ${created} created, ${skipped} skipped`, created > 0 ? 'success' : 'error');
    fetchDestinations();
    setSeeding(false);
  };

  // Form handlers
  const openAddModal = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (dest) => {
    setForm({
      name: dest.name || '',
      country: dest.country || '',
      image: dest.image || '',
      heroImage: dest.heroImage || '',
      gallery: (dest.gallery || []).join(', '),
      tag: dest.tag || '',
      description: dest.description || '',
      longDescription: dest.longDescription || '',
      highlights: (dest.highlights || []).join(', '),
      seo: {
        metaTitle: dest.seo?.metaTitle || '',
        metaDescription: dest.seo?.metaDescription || '',
        ogImage: dest.seo?.ogImage || ''
      },
      continent: dest.continent || '',
      isFeatured: dest.isFeatured || false,
      isActive: dest.isActive !== false,
      order: dest.order || 0
    });
    setEditingId(dest._id);
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.image.trim()) newErrors.image = 'Image URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const payload = {
      ...form,
      gallery: form.gallery ? form.gallery.split(',').map(s => s.trim()).filter(Boolean) : [],
      highlights: form.highlights ? form.highlights.split(',').map(s => s.trim()).filter(Boolean) : [],
      order: Number(form.order) || 0
    };

    try {
      const url = editingId ? `${API_BASE}/destinations/${editingId}` : `${API_BASE}/destinations`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast(editingId ? 'Destination updated successfully' : 'Destination created successfully', 'success');
        setModalOpen(false);
        fetchDestinations();
      } else {
        toast(data.message || 'Operation failed', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/destinations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        toast('Destination deleted successfully', 'success');
        fetchDestinations();
      } else {
        toast(data.message || 'Delete failed', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Inline toggle for isActive / isFeatured
  const handleToggle = async (id, field, currentValue) => {
    try {
      const res = await fetch(`${API_BASE}/destinations/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ [field]: !currentValue })
      });
      const data = await res.json();
      if (data.success) {
        setDestinations(prev => prev.map(d => d._id === id ? { ...d, [field]: !currentValue } : d));
        toast(`${field === 'isActive' ? 'Active' : 'Featured'} status updated`, 'success');
      } else {
        toast(data.message || 'Update failed', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    }
  };

  // Drag and drop reorder
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(destinations);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const updatedItems = items.map((item, idx) => ({ ...item, order: idx }));
    setDestinations(updatedItems);

    const orders = updatedItems.map((item, idx) => ({ id: item._id, order: idx }));
    try {
      const res = await fetch(`${API_BASE}/destinations/reorder`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orders })
      });
      const data = await res.json();
      if (data.success) {
        toast('Order updated', 'success');
      } else {
        toast(data.message || 'Reorder failed', 'error');
        fetchDestinations();
      }
    } catch {
      toast('Network error. Please try again.', 'error');
      fetchDestinations();
    }
  };

  // Toggle switch component
  const ToggleSwitch = ({ checked, onChange, label }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      aria-label={label}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Destination Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDestinations}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Seed Sample Destinations
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Destination
          </button>
        </div>
      </div>

      {/* Table with drag-and-drop */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="destinations">
            {(provided) => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-10"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-white divide-y divide-gray-200"
                  >
                    {destinations.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                          No destinations found. Click "Add Destination" to create one.
                        </td>
                      </tr>
                    ) : (
                      destinations.map((dest, index) => (
                        <Draggable key={dest._id} draggableId={dest._id} index={index}>
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'bg-blue-50 shadow-lg' : 'hover:bg-gray-50'} transition-colors`}
                            >
                              <td className="px-3 py-3" {...provided.dragHandleProps}>
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                              </td>
                              <td className="px-4 py-3">
                                {dest.image ? (
                                  <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{dest.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{dest.country}</td>
                              <td className="px-4 py-3">
                                {dest.tag && (
                                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    {dest.tag}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <ToggleSwitch
                                  checked={dest.isFeatured}
                                  onChange={() => handleToggle(dest._id, 'isFeatured', dest.isFeatured)}
                                  label="Toggle featured"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <ToggleSwitch
                                  checked={dest.isActive !== false}
                                  onChange={() => handleToggle(dest._id, 'isActive', dest.isActive)}
                                  label="Toggle active"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{dest.order ?? 0}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {dest.createdAt ? new Date(dest.createdAt).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditModal(dest)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(dest._id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </tbody>
                </table>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Destination</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this destination? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Destination' : 'Add Destination'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="e.g. Paris"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="e.g. France"
                  />
                  {errors.country && <p className="mt-1 text-xs text-red-600">{errors.country}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.image ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="https://..."
                />
                {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery URLs (comma-separated)</label>
                <input
                  type="text"
                  value={form.gallery}
                  onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="url1, url2, url3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <input
                    type="text"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Popular"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Continent</label>
                  <select
                    value={form.continent}
                    onChange={(e) => setForm({ ...form, continent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select continent</option>
                    {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Short description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                <textarea
                  value={form.longDescription}
                  onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Detailed description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (comma-separated)</label>
                <input
                  type="text"
                  value={form.highlights}
                  onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Eiffel Tower, Louvre Museum, ..."
                />
              </div>

              {/* SEO Metadata */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">SEO Metadata</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={form.seo.metaTitle}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Page title for search engines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={form.seo.metaDescription}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Description for search engines"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={form.seo.ogImage}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Toggles and Order */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={form.isFeatured}
                      onChange={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                      label="Featured"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      checked={form.isActive}
                      onChange={() => setForm({ ...form, isActive: !form.isActive })}
                      label="Active"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationManagement;