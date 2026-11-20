import React, { useState } from 'react';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  User, Shield, Search, RefreshCw, Mail, Phone, Calendar, 
  CheckCircle, XCircle, MoreVertical, Edit, Trash2
} from 'lucide-react';

export const FullWidthUsersTable = ({
  users = [],
  loading = false,
  onRefresh,
  onToggleStatus,
  onDeleteUser,
  selectedIds = [],
  onSelectItem,
  onSelectAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'admin' && u.role !== 'admin' && u.role !== 'super_admin') return false;
    if (roleFilter === 'user' && u.role !== 'user') return false;
    if (roleFilter === 'active' && u.isActive === false && u.status === 'inactive') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = `${u.fullname?.firstname || ''} ${u.fullname?.lastname || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  const allSelected = filteredUsers.length > 0 && selectedIds.length === filteredUsers.length;

  return (
    <div className="w-full space-y-4">
      {/* Subtabs Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Users', count: users.length },
            { id: 'admin', label: 'Admins & Staff', count: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length },
            { id: 'user', label: 'Customers', count: users.filter(u => u.role === 'user' || !u.role).length },
            { id: 'active', label: 'Active', count: users.filter(u => u.isActive !== false && u.status !== 'inactive').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${roleFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="shrink-0 text-xs font-semibold h-8"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="overflow-x-auto w-full">
          <Table className="w-full min-w-[800px]">
            <TableHeader className="bg-slate-50/90 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked ? filteredUsers.map(u => u._id) : [])}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  User Details
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Joined Date
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const fullName = `${u.fullname?.firstname || ''} ${u.fullname?.lastname || ''}`.trim() || 'Anonymous User';
                  const initial = (u.fullname?.firstname?.[0] || u.email?.[0] || 'U').toUpperCase();
                  const role = u.role || 'user';
                  const isActive = u.isActive !== false && u.status !== 'inactive';
                  const isSelected = selectedIds.includes(u._id);

                  return (
                    <TableRow key={u._id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <TableCell className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectItem && onSelectItem(u._id)}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                            {initial}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u._id?.slice(-8)}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${
                          role === 'super_admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : (role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200')
                        }`}>
                          {role.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus && onToggleStatus(u._id, !isActive)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border cursor-pointer transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleStatus && onToggleStatus(u._id, !isActive)}
                            className="h-7 px-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          {onDeleteUser && (
                            <button
                              onClick={() => onDeleteUser(u._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
export default FullWidthUsersTable;
