import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, Award, RefreshCw } from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [summaries, setSummaries] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/cycles').then(r => setCycles(r.data || [])).catch(() => {});
    api.get('/users').then(r => setAllUsers(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCycle) { setSummaries([]); setStats(null); return; }
    setLoading(true);
    api.get(`/appraisal-summary/cycle/${selectedCycle}`)
      .then(r => {
        const data = r.data || [];
        setSummaries(data);
        computeStats(data);
      })
      .catch(() => toast.error('Failed to load cycle summaries'))
      .finally(() => setLoading(false));
  }, [selectedCycle]);

  const computeStats = (data) => {
    if (!data.length) { setStats(null); return; }
    const total = data.length;
    const eligible = data.filter(s => s.promotionRecommended).length;
    const avgScore = data.reduce((s, d) => s + (d.avgManagerScore || 0), 0) / total;
    const avgCommittee = data.reduce((s, d) => s + (d.avgCommitteeScore || 0), 0) / total;

    // By department
    const deptMap = {};
    data.forEach(s => {
      const dept = s.employee?.department || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { scores: [], count: 0 };
      deptMap[dept].scores.push(s.avgManagerScore || 0);
      deptMap[dept].count++;
    });
    const byDept = Object.entries(deptMap).map(([dept, { scores, count }]) => ({
      dept,
      avg: (scores.reduce((a, b) => a + b, 0) / count).toFixed(2),
      count,
    })).sort((a, b) => b.avg - a.avg);

    setStats({ total, eligible, promotionRate: ((eligible / total) * 100).toFixed(1), avgScore: avgScore.toFixed(2), avgCommittee: avgCommittee.toFixed(2), byDept });
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-500 mt-1">View performance metrics and cycle summaries.</p>
      </div>

      {/* Org-wide stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: allUsers.filter(u => u.role === 'EMPLOYEE').length, icon: Users, color: 'bg-blue-500' },
          { label: 'Total Managers', value: allUsers.filter(u => u.role === 'MANAGER').length, icon: Users, color: 'bg-indigo-500' },
          { label: 'Total Cycles', value: cycles.length, icon: BarChart3, color: 'bg-amber-500' },
          { label: 'Active Cycles', value: cycles.filter(c => ['ACTIVE','SELF_ASSESSMENT','MANAGER_REVIEW','COMMITTEE_REVIEW'].includes(c.status)).length, icon: TrendingUp, color: 'bg-emerald-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cycle selector */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Cycle Performance Analysis</h2>
        <select
          className="w-full md:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={selectedCycle}
          onChange={e => setSelectedCycle(e.target.value)}
        >
          <option value="">— Select a cycle —</option>
          {cycles.map(c => <option key={c.id} value={c.id}>{c.cycleName} ({c.status})</option>)}
        </select>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {!loading && stats && (
          <div className="mt-8 space-y-8">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Appraised', value: stats.total },
                { label: 'Promotion Eligible', value: stats.eligible },
                { label: 'Promotion Rate', value: `${stats.promotionRate}%` },
                { label: 'Avg Manager Score', value: stats.avgScore },
                { label: 'Avg Committee Score', value: stats.avgCommittee },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Dept breakdown */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Avg Score by Department</h3>
              <div className="space-y-3">
                {stats.byDept.map(({ dept, avg, count }) => (
                  <div key={dept} className="flex items-center gap-4">
                    <span className="w-36 text-sm text-slate-600 font-medium truncate" title={dept}>{dept}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(avg / 5) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-10 text-right">{avg}</span>
                    <span className="text-xs text-slate-400 w-16">{count} emp.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">All Appraisals in Cycle</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Employee', 'Department', 'Designation', 'Manager Avg', 'Committee Score', 'Promotion'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {summaries.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{s.employee?.name}</td>
                        <td className="px-4 py-3 text-slate-500">{s.employee?.department}</td>
                        <td className="px-4 py-3 text-slate-500">{s.employee?.designation}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{(s.avgManagerScore ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-3 font-bold text-purple-600">{s.avgCommitteeScore != null ? s.avgCommitteeScore.toFixed(2) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold
                            ${s.promotionRecommended ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {s.promotionRecommended ? 'Eligible' : 'Not Eligible'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!loading && selectedCycle && !stats && (
          <p className="text-slate-400 text-center py-10 italic">No appraisal data for this cycle yet.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
