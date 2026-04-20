import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, User, Building, Briefcase, Calendar, Loader2 } from 'lucide-react';

const CreateUser = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
    designation: '',
    joiningDate: '',
    managerId: ''
  });
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.role === 'EMPLOYEE') {
      const fetchManagers = async () => {
        try {
          const response = await api.get('/users/role/MANAGER');
          setManagers(response.data || []);
        } catch (err) {
          console.error('Failed to fetch managers', err);
        }
      };
      fetchManagers();
    } else {
      setManagers([]);
      setFormData(prev => ({ ...prev, managerId: '' }));
    }
  }, [formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = { ...formData };
      if (payload.role !== 'EMPLOYEE') {
        payload.managerId = null; // Ensuring no managerId if not employee
      }
      
      await api.post('/users', payload);
      toast.success('User created successfully');
      setFormData({
        name: '', email: '', password: '', role: 'EMPLOYEE', department: '', designation: '', joiningDate: '', managerId: ''
      });
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'object' && !err.response.data.message) {
            const errorMsgs = Object.values(err.response.data).join(', ');
            toast.error(errorMsgs || 'Validation failed');
        } else {
            toast.error(err.response.data.message || err.response.data || 'Failed to create user');
        }
      } else {
        toast.error('Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-6 bg-slate-50 min-h-full">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 p-10 border border-slate-100">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Create User Account</h2>
              <p className="text-slate-500 text-sm">Provision a new internal role-based account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User size={18} />
                  </div>
                  <input name="name" required value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" placeholder="user@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20">
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  {currentUser?.role === 'ADMIN' && (
                    <>
                      <option value="HR_MANAGER">HR Manager</option>
                      <option value="REVIEW_COMMITTEE">Review Committee</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Building size={18} />
                  </div>
                  <input name="department" required value={formData.department} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" placeholder="Engineering" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Briefcase size={18} />
                  </div>
                  <input name="designation" required value={formData.designation} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" placeholder="Software Engineer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Joining Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input type="date" name="joiningDate" required value={formData.joiningDate} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>

              {formData.role === 'EMPLOYEE' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Reporting Manager</label>
                  <select name="managerId" required value={formData.managerId} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20">
                    <option value="">Select Manager</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
