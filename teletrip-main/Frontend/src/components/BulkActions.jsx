import React, { useState } from 'react';
import { Check, X, Mail, Download, Trash2, UserCheck, UserX, CheckSquare, Square } from 'lucide-react';

const BulkActionsBar = ({ selectedCount, onSelectAll, onDeselectAll, onBulkAction, activeTab, allSelected }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', message: '' });

  const handleBulkEmail = () => {
    setShowEmailModal(true);
  };

  const sendBulkEmail = () => {
    onBulkAction('email', emailContent);
    setShowEmailModal(false);
    setEmailContent({ subject: '', message: '' });
  };

  const getActions = () => {
    switch (activeTab) {
      case 'users':
        return [
          { icon: UserCheck, label: 'Activate', action: 'activate', color: 'green' },
          { icon: UserX, label: 'Deactivate', action: 'deactivate', color: 'yellow' },
          { icon: Mail, label: 'Email', action: 'email', color: 'blue' },
          { icon: Download, label: 'Export', action: 'export', color: 'purple' },
          { icon: Trash2, label: 'Delete', action: 'delete', color: 'red' }
        ];
      case 'bookings':
        return [
          { icon: Check, label: 'Approve', action: 'approve', color: 'green' },
          { icon: X, label: 'Reject', action: 'reject', color: 'red' },
          { icon: Mail, label: 'Email', action: 'email', color: 'blue' },
          { icon: Download, label: 'Export', action: 'export', color: 'purple' }
        ];
      case 'hotels':
        return [
          { icon: Check, label: 'Approve', action: 'approve', color: 'green' },
          { icon: X, label: 'Reject', action: 'reject', color: 'red' },
          { icon: Download, label: 'Export', action: 'export', color: 'purple' },
          { icon: Trash2, label: 'Delete', action: 'delete', color: 'red' }
        ];
      case 'payments':
        return [
          { icon: Download, label: 'Export', action: 'export', color: 'purple' },
          { icon: Mail, label: 'Email', action: 'email', color: 'blue' }
        ];
      case 'support':
        return [
          { icon: Check, label: 'Close', action: 'close', color: 'green' },
          { icon: Mail, label: 'Email', action: 'email', color: 'blue' },
          { icon: Download, label: 'Export', action: 'export', color: 'purple' }
        ];
      default:
        return [];
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-600 hover:bg-green-700',
      red: 'bg-red-600 hover:bg-red-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
      purple: 'bg-purple-600 hover:bg-purple-700'
    };
    return colors[color] || 'bg-gray-600 hover:bg-gray-700';
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            {!allSelected && (
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Select all
              </button>
            )}
            <button
              onClick={onDeselectAll}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Deselect all
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getActions().map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.action}
                onClick={() => action.action === 'email' ? handleBulkEmail() : onBulkAction(action.action)}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition ${getColorClasses(action.color)}`}
                title={action.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Bulk Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailContent.subject}
                  onChange={(e) => setEmailContent({ ...emailContent, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={emailContent.message}
                  onChange={(e) => setEmailContent({ ...emailContent, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Email message"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkEmail}
                  disabled={!emailContent.subject || !emailContent.message}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send to {selectedCount} recipient{selectedCount !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionsBar;
