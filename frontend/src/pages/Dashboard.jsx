import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  Target, 
  ShieldCheck, 
  Award, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const response = await api.get('/cycles/active');
        if (response.data.length > 0) {
          setActiveCycle(response.data[0]);
        }
      } catch (err) {
        console.error('Failed to fetch active cycle');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveCycle();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1">Here's what is happening in the current performance cycle.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 flex items-center gap-2 text-sm font-medium">
            <Clock size={16} />
            {activeCycle ? activeCycle.cycleName : 'No Active Cycle'}
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Overall Progress" value="65%" icon={BarChart3} color="bg-blue-500" />
        <StatCard title="Self Assessment" value={user?.role === 'EMPLOYEE' ? 'Submitted' : '48/120'} icon={Target} color="bg-indigo-500" />
        <StatCard title="Pending Reviews" value="12" icon={Clock} color="bg-amber-500" />
        <StatCard title="Promotions Eligible" value="5" icon={Award} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Timeline Component */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="text-indigo-600" size={24} />
            Appraisal Timeline
          </h3>
          
          <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <h4 className="font-bold text-slate-900">Self Assessment Phase</h4>
              <p className="text-sm text-slate-500">Deadline: March 15, 2026</p>
            </div>

            <div className="relative pl-10">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white shadow-sm flex items-center justify-center">
                <Clock size={12} className="text-white" />
              </div>
              <h4 className="font-bold text-slate-900">Manager Review Phase</h4>
              <p className="text-sm text-indigo-600 font-medium">In Progress</p>
              <p className="text-sm text-slate-500">Deadline: March 30, 2026</p>
            </div>

            <div className="relative pl-10 opacity-50">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center">
                <ShieldCheck size={12} className="text-slate-400" />
              </div>
              <h4 className="font-bold text-slate-900">Committee Review</h4>
              <p className="text-sm text-slate-500">Starts: April 01, 2026</p>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-200 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-4">Action Required</h3>
            <p className="text-indigo-100 mb-8 leading-relaxed">
              Your self-assessment has been successfully submitted. You will be notified once your manager completes their review.
            </p>
          </div>
          
          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-amber-300" />
              <div>
                <p className="font-bold">Pro Tip</p>
                <p className="text-xs text-indigo-50">Ensure all your KPIs are updated before the deadline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
