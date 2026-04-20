import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Save, Eye, Loader2, Plus, X, Code
} from 'lucide-react';
import { EmailManagementAPI } from '../../services/emailApi';

const CATEGORIES = ['booking', 'payment', 'account', 'support', 'marketing', 'system'];

const TemplateEditor = ({ templateId, onClose, showToast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // Template fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('system');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [variables, setVariables] = useState([]);
  const [sampleData, setSampleData] = useState({});
  const [isActive, setIsActive] = useState(true);

  // Preview
  const [previewHtml, setPreviewHtml] = useState('');

  const editorRef = useRef(null);

  // Load template
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await EmailManagementAPI.getTemplate(templateId);
      if (result.success) {
        const t = result.data;
        setName(t.name || '');
        setSlug(t.slug || '');
        setCategory(t.category || 'system');
        setSubject(t.subject || '');
        setHtmlContent(t.htmlContent || '');
        setVariables(t.variables || []);
        setSampleData(t.sampleData || {});
        setIsActive(t.isActive !== false);
        setPreviewHtml(t.htmlContent || '');
      } else {
        showToast?.(result.error, 'error');
      }
      setLoading(false);
    };
    load();
  }, [templateId, showToast]);

  // Insert variable at cursor position in textarea
  const insertVariable = useCallback((varKey) => {
    const textarea = editorRef.current;
    if (!textarea) {
      setHtmlContent((prev) => prev + `{{${varKey}}}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = `{{${varKey}}}`;
    const before = htmlContent.substring(0, start);
    const after = htmlContent.substring(end);
    const newContent = before + text + after;
    setHtmlContent(newContent);

    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  }, [htmlContent]);

  // Preview
  const handlePreview = async () => {
    setPreviewing(true);
    const result = await EmailManagementAPI.previewTemplate(templateId, {
      htmlContent,
      subject,
      sampleData,
    });
    if (result.success) {
      setPreviewHtml(result.data.html || result.data.renderedHtml || htmlContent);
    } else {
      // Fallback: show raw HTML in preview
      setPreviewHtml(htmlContent);
      showToast?.(result.error || 'Preview fallback: showing raw HTML', 'info');
    }
    setPreviewing(false);
  };

  // Save
  const handleSave = async () => {
    setSaving(true);
    const result = await EmailManagementAPI.updateTemplate(templateId, {
      name,
      slug,
      category,
      subject,
      htmlContent,
      variables,
      sampleData,
      isActive,
    });
    if (result.success) {
      showToast?.('Template saved', 'success');
    } else {
      showToast?.(result.error, 'error');
    }
    setSaving(false);
  };

  // Variable management
  const addVariable = () => {
    setVariables((prev) => [
      ...prev,
      { key: '', description: '', required: false, defaultValue: '' },
    ]);
  };

  const updateVariable = (index, field, value) => {
    setVariables((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeVariable = (index) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  // Sample data management
  const updateSampleData = (key, value) => {
    setSampleData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Back to list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Template</h2>
              <p className="text-sm text-gray-500 font-mono">{slug}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              disabled={previewing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Metadata fields */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Booking Confirmed - {{bookingReference}}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Variable chips */}
      {variables.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">Insert Variable</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {variables.map((v, i) => (
              <button
                key={i}
                onClick={() => insertVariable(v.key)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition border border-blue-200"
                title={v.description || v.key}
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Split panel: Editor + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: HTML Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">HTML Content</h3>
          </div>
          <textarea
            ref={editorRef}
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm text-gray-800 resize-none focus:outline-none min-h-[400px]"
            spellCheck={false}
            placeholder="Enter your HTML email template here..."
          />
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">Preview</h3>
          </div>
          <div className="flex-1 min-h-[400px]">
            <iframe
              srcDoc={previewHtml || '<p style="padding:24px;color:#999;">Click Preview to render the template.</p>'}
              title="Template Preview"
              className="w-full h-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Variables editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Template Variables</h3>
          <button
            onClick={addVariable}
            className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-4 h-4" /> Add Variable
          </button>
        </div>
        {variables.length === 0 ? (
          <p className="text-sm text-gray-400">No variables defined.</p>
        ) : (
          <div className="space-y-3">
            {variables.map((v, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={v.key}
                  onChange={(e) => updateVariable(i, 'key', e.target.value)}
                  placeholder="key"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <input
                  type="text"
                  value={v.description}
                  onChange={(e) => updateVariable(i, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={sampleData[v.key] || ''}
                  onChange={(e) => updateSampleData(v.key, e.target.value)}
                  placeholder="Sample value"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
                <label className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={v.required}
                    onChange={(e) => updateVariable(i, 'required', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded"
                  />
                  Required
                </label>
                <button
                  onClick={() => removeVariable(i)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Remove variable"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateEditor;
