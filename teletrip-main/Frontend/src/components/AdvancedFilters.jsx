import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, X, Calendar, ChevronDown, Save, Trash2, 
  Download, MapPin, CreditCard, Package, Users, Star
} from 'lucide-react';

// Date Range Picker Component
export const DateRangePicker = ({ startDate, endDate, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="block text-xs text-gray-600 mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange({ startDate: e.target.value, endDate })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-gray-600 mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange({ startDate, endDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>
    </div>
  );
};

// Multi-Select Dropdown Component
export const MultiSelect = ({ label, options, selected, onChange, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between text-sm"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span className="text-gray-700">
            {selected.length > 0 ? `${selected.length} selected` : `Select ${label}`}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// Advanced Search with Autocomplete
export const AdvancedSearch = ({ value, onChange, onSearch, suggestions = [], placeholder }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (value && suggestions.length > 0) {
      const filtered = suggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSearch && onSearch(suggestion);
  };

  return (
    <div className="relative flex-1" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch && onSearch(value)}
          placeholder={placeholder || "Search..."}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Filter Chips Component
export const FilterChips = ({ filters, onRemove, onClear }) => {
  const activeFilters = [];

  if (filters.search) activeFilters.push({ key: 'search', label: `Search: ${filters.search}` });
  if (filters.startDate) activeFilters.push({ key: 'startDate', label: `From: ${filters.startDate}` });
  if (filters.endDate) activeFilters.push({ key: 'endDate', label: `To: ${filters.endDate}` });
  if (filters.status?.length > 0) activeFilters.push({ key: 'status', label: `Status: ${filters.status.join(', ')}` });
  if (filters.paymentMethod?.length > 0) activeFilters.push({ key: 'paymentMethod', label: `Payment: ${filters.paymentMethod.join(', ')}` });
  if (filters.location?.length > 0) activeFilters.push({ key: 'location', label: `Location: ${filters.location.join(', ')}` });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key)}
            className="hover:bg-blue-200 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClear}
        className="text-sm text-red-600 hover:text-red-800 font-medium ml-2"
      >
        Clear All
      </button>
    </div>
  );
};

// Saved Filter Presets Component
export const FilterPresets = ({ presets, onLoad, onSave, onDelete, currentFilters }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSave = () => {
    if (presetName.trim()) {
      onSave(presetName, currentFilters);
      setPresetName('');
      setShowSaveModal(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          onChange={(e) => e.target.value && onLoad(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          defaultValue=""
        >
          <option value="">Load Preset...</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowSaveModal(true)}
          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Enter preset name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {presets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm"
            >
              <button
                onClick={() => onLoad(preset.id)}
                className="text-gray-700 hover:text-blue-600"
              >
                {preset.name}
              </button>
              <button
                onClick={() => onDelete(preset.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Advanced Filter Panel Component
export const AdvancedFilterPanel = ({ 
  filters, 
  onChange, 
  onApply, 
  onReset,
  onExport,
  activeTab 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentMethodOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'pay_on_site', label: 'Pay on Site' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const locationOptions = [
    { value: 'karachi', label: 'Karachi' },
    { value: 'lahore', label: 'Lahore' },
    { value: 'islamabad', label: 'Islamabad' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'london', label: 'London' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            <Filter className="w-5 h-5" />
            Advanced Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <AdvancedSearch
          value={filters.search}
          onChange={(value) => onChange({ ...filters, search: value })}
          onSearch={onApply}
          placeholder={`Search ${activeTab}...`}
        />
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={(dates) => onChange({ ...filters, ...dates })}
            />

            <MultiSelect
              label="Status"
              options={statusOptions}
              selected={filters.status || []}
              onChange={(status) => onChange({ ...filters, status })}
              icon={Package}
            />

            <MultiSelect
              label="Payment Method"
              options={paymentMethodOptions}
              selected={filters.paymentMethod || []}
              onChange={(paymentMethod) => onChange({ ...filters, paymentMethod })}
              icon={CreditCard}
            />

            <MultiSelect
              label="Location"
              options={locationOptions}
              selected={filters.location || []}
              onChange={(location) => onChange({ ...filters, location })}
              icon={MapPin}
            />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={onApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
            <button
              onClick={onReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
