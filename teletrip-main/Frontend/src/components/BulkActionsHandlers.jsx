// Bulk Actions Handler Functions
import { AdminDashboardAPI } from '../services/adminApi';

export const createBulkHandlers = (activeTab, selectedIds, showToast, loadData, setSelectedIds) => {
  
  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (allIds) => {
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkAction = async (action, data = {}) => {
    if (selectedIds.length === 0) {
      showToast('No items selected', 'error');
      return;
    }

    try {
      let result;
      
      switch (activeTab) {
        case 'users':
          if (action === 'activate' || action === 'deactivate') {
            result = await AdminDashboardAPI.bulkUpdateUsers(selectedIds, action);
          } else if (action === 'delete') {
            if (!window.confirm(`Delete ${selectedIds.length} users?`)) return;
            result = await AdminDashboardAPI.bulkUpdateUsers(selectedIds, 'delete');
          } else if (action === 'email') {
            result = await AdminDashboardAPI.bulkEmail('users', selectedIds, data);
          } else if (action === 'export') {
            result = await AdminDashboardAPI.bulkExport('users', selectedIds);
            if (result.success) {
              const blob = new Blob([result.data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `users_bulk_${Date.now()}.csv`;
              a.click();
              showToast('Export successful', 'success');
              setSelectedIds([]);
              return;
            }
          }
          break;

        case 'bookings':
          if (action === 'approve' || action === 'reject') {
            if (!window.confirm(`${action} ${selectedIds.length} bookings?`)) return;
            result = await AdminDashboardAPI.bulkUpdateBookings(selectedIds, action);
          } else if (action === 'email') {
            result = await AdminDashboardAPI.bulkEmail('bookings', selectedIds, data);
          } else if (action === 'export') {
            result = await AdminDashboardAPI.bulkExport('bookings', selectedIds);
            if (result.success) {
              const blob = new Blob([result.data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `bookings_bulk_${Date.now()}.csv`;
              a.click();
              showToast('Export successful', 'success');
              setSelectedIds([]);
              return;
            }
          }
          break;

        case 'hotels':
          if (action === 'approve' || action === 'reject') {
            if (!window.confirm(`${action} ${selectedIds.length} hotels?`)) return;
            result = await AdminDashboardAPI.bulkUpdateHotels(selectedIds, action);
          } else if (action === 'delete') {
            if (!window.confirm(`Delete ${selectedIds.length} hotels?`)) return;
            result = await AdminDashboardAPI.bulkUpdateHotels(selectedIds, 'delete');
          } else if (action === 'export') {
            result = await AdminDashboardAPI.bulkExport('hotels', selectedIds);
            if (result.success) {
              const blob = new Blob([result.data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hotels_bulk_${Date.now()}.csv`;
              a.click();
              showToast('Export successful', 'success');
              setSelectedIds([]);
              return;
            }
          }
          break;

        case 'payments':
          if (action === 'email') {
            result = await AdminDashboardAPI.bulkEmail('payments', selectedIds, data);
          } else if (action === 'export') {
            result = await AdminDashboardAPI.bulkExport('payments', selectedIds);
            if (result.success) {
              const blob = new Blob([result.data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payments_bulk_${Date.now()}.csv`;
              a.click();
              showToast('Export successful', 'success');
              setSelectedIds([]);
              return;
            }
          }
          break;

        case 'support':
          if (action === 'close') {
            if (!window.confirm(`Close ${selectedIds.length} tickets?`)) return;
            result = await AdminDashboardAPI.bulkUpdateTickets(selectedIds, 'close');
          } else if (action === 'email') {
            result = await AdminDashboardAPI.bulkEmail('support', selectedIds, data);
          } else if (action === 'export') {
            result = await AdminDashboardAPI.bulkExport('support', selectedIds);
            if (result.success) {
              const blob = new Blob([result.data], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `support_bulk_${Date.now()}.csv`;
              a.click();
              showToast('Export successful', 'success');
              setSelectedIds([]);
              return;
            }
          }
          break;

        default:
          showToast('Invalid action', 'error');
          return;
      }

      if (result && result.success) {
        showToast(`Bulk ${action} successful`, 'success');
        setSelectedIds([]);
        loadData();
      } else {
        showToast(result?.error || 'Bulk action failed', 'error');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Bulk action failed', 'error');
    }
  };

  return {
    handleSelectItem,
    handleSelectAll,
    handleDeselectAll,
    handleBulkAction
  };
};
