import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Users, Shield, Trash2, Edit2, Check, X, Search, Loader2 } from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateRole = async (id) => {
    try {
      await api.put(`/users/${id}/role?role=${newRole}`);
      toast.success('Role updated successfully');
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      setEditingId(null);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'REVIEW_COMMITTEE', 'ADMIN'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Loading organization directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users size={16} />
          <span>Showing {filteredUsers.length} users</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Permissions</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-xs font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                        >
                          {roles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                        </select>
                        <button onClick={() => handleUpdateRole(u.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-1 rounded-lg">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' : 
                            u.role === 'HR_MANAGER' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' :
                            u.role === 'REVIEW_COMMITTEE' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          <Shield size={10} />
                          {u.role.replace('_', ' ')}
                        </span>
                        {currentUser?.role === 'ADMIN' && (
                          <button 
                            onClick={() => { setEditingId(u.id); setNewRole(u.role); }}
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{u.department}</div>
                    <div className="text-xs text-slate-400">{u.designation}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {currentUser?.role === 'ADMIN' && u.email !== currentUser.email && (
                      <button 
                        onClick={() => handleDelete(u.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Users size={32} />
              </div>
              <p className="text-slate-400 italic">No users found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
