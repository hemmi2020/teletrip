import React, { useState } from 'react';
import { FileText, Send, ScrollText, BarChart3 } from 'lucide-react';
import TemplateList from './TemplateList';
import BulkEmailComposer from './BulkEmailComposer';
import EmailLogsViewer from './EmailLogsViewer';
import EmailStatsCards from './EmailStatsCards';

const SUB_TABS = [
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'bulk', label: 'Bulk Email', icon: Send },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

const EmailManagementTab = ({ showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState('templates');

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'templates':
        return <TemplateList showToast={showToast} />;
      case 'bulk':
        return <BulkEmailComposer showToast={showToast} />;
      case 'logs':
        return <EmailLogsViewer showToast={showToast} />;
      case 'stats':
        return <EmailStatsCards showToast={showToast} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-navigation tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto" aria-label="Email management tabs">
            {SUB_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sub-tab content */}
      {renderSubTabContent()}
    </div>
  );
};

export default EmailManagementTab;
