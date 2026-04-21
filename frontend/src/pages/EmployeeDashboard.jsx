import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  User as UserIcon, 
  ChevronRight, 
  Award,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cycleRes, promoRes] = await Promise.all([
        api.get('/cycles/active'),
        api.get(`/promotions/employee/${user.id}`)
      ]);
      setActiveCycle(cycleRes.data?.[0]);
      setPromotionHistory(promoRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isCycleActive = activeCycle?.status === 'ACTIVE' || activeCycle?.status === 'SELF_ASSESSMENT';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-500 mt-1">Here's an overview of your performance and growth.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="pr-4">
            <div className="text-sm font-bold text-slate-900">{user?.designation}</div>
            <div className="text-xs text-slate-500">{user?.department}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Appraisal Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-indigo-600" size={22} /> Active Appraisal
                </h2>
                {activeCycle ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${isCycleActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {activeCycle.status.replace('_', ' ')}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-400">
                    No Active Cycle
                  </span>
                )}
              </div>

              {activeCycle ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{activeCycle.cycleName}</h3>
                    <p className="text-slate-500 text-sm mt-1">Timeline: {activeCycle.startDate} to {activeCycle.endDate}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2">
                        <Clock size={14} /> Self-Assessment Deadline
                      </div>
                      <div className="text-slate-800 font-bold">{activeCycle.selfAssessmentDeadline}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-2">
                        <TrendingUp size={14} /> Manager Review
                      </div>
                      <div className="text-slate-800 font-bold">{activeCycle.managerAssessmentDeadline}</div>
                    </div>
                  </div>

                  <div className="pt-4">
                    {isCycleActive ? (
                      <Link 
                        to="/self-assessment"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all group"
                      >
                        Start Self-Assessment
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 text-sm">
                        <AlertCircle size={20} />
                        Self-assessment is not currently open for this cycle.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Calendar size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">No performance appraisal cycles are currently active.</p>
                </div>
              )}
            </div>
            
            {activeCycle && (
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Process Workflow</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="w-8 h-1 rounded-full bg-indigo-100"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-8 h-1 rounded-full bg-slate-100"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile / Team Section */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
              <UserIcon className="text-indigo-600" size={22} /> Reporting Line
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                  {user?.manager?.name?.charAt(0) || 'M'}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Primary Manager</div>
                  <div className="font-bold text-slate-800">{user?.manager?.name || 'Not Assigned'}</div>
                  <div className="text-sm text-slate-500">{user?.manager?.designation || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Department</div>
                  <div className="font-bold text-slate-800">{user?.department}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                <Award size={22} /> Recognition
              </h2>
              <p className="text-indigo-200 text-sm mb-6">Total promotions earned during your tenure.</p>
              <div className="text-5xl font-black">{promotionHistory.length}</div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12">
              <Award size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
          <Clock className="text-indigo-600" size={22} /> Promotion History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Role</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">New Designation</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Effective Date</th>
                <th className="pb-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {promotionHistory.length > 0 ? (
                promotionHistory.map((promo, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 font-medium text-slate-600">{promo.oldDesignation || 'Initial'}</td>
                    <td className="py-4 font-bold text-slate-800">{promo.newDesignation}</td>
                    <td className="py-4 text-sm text-slate-500">{promo.effectiveDate}</td>
                    <td className="py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${promo.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                          promo.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {promo.status === 'APPROVED' ? <CheckCircle2 size={10} /> : 
                         promo.status === 'REJECTED' ? <AlertCircle size={10} /> : 
                         <Clock size={10} />}
                        {promo.status || 'APPLIED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 italic">No promotion records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
