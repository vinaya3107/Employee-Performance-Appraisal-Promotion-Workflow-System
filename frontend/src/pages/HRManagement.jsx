import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Target, ChevronRight, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import api from '../services/api';

const cycleStatusOrder = ['DRAFT', 'ACTIVE', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'COMMITTEE_REVIEW', 'COMPLETED'];
const statusColors = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  SELF_ASSESSMENT: 'bg-indigo-100 text-indigo-700',
  MANAGER_REVIEW: 'bg-amber-100 text-amber-700',
  COMMITTEE_REVIEW: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const HRManagement = () => {
  const [cycles, setCycles] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showKPIForm, setShowKPIForm] = useState(false);
  const [activeTab, setActiveTab] = useState('cycles');

  const [newCycle, setNewCycle] = useState({
    cycleName: '', startDate: '', endDate: '',
    selfAssessmentDeadline: '', managerAssessmentDeadline: '', committeeReviewDeadline: '',
  });

  const [newKPI, setNewKPI] = useState({
    kpiName: '', category: 'TECHNICAL', weightage: 20, applicableDesignation: '',
  });

  useEffect(() => {
    fetchCycles();
    fetchKPIs();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get('/cycles');
      setCycles(res.data || []);
    } catch { toast.error('Failed to load cycles'); }
  };

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/kpis');
      setKpis(res.data || []);
    } catch { toast.error('Failed to load KPIs'); }
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cycles', newCycle);
      toast.success('Appraisal cycle created!');
      setShowCycleForm(false);
      setNewCycle({ cycleName: '', startDate: '', endDate: '', selfAssessmentDeadline: '', managerAssessmentDeadline: '', committeeReviewDeadline: '' });
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to create cycle');
    }
  };

  const handleCreateKPI = async (e) => {
    e.preventDefault();
    try {
      await api.post('/kpis', { ...newKPI, weightage: parseFloat(newKPI.weightage) });
      toast.success('KPI added successfully!');
      setShowKPIForm(false);
      setNewKPI({ kpiName: '', category: 'TECHNICAL', weightage: 20, applicableDesignation: '' });
      fetchKPIs();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to add KPI');
    }
  };

  const activateCycle = async (id) => {
    try {
      await api.put(`/cycles/${id}/activate`);
      toast.success('Cycle activated!');
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to activate');
    }
  };

  const transitionCycle = async (id, status) => {
    try {
      await api.put(`/cycles/${id}/transition?status=${status}`);
      toast.success(`Cycle moved to ${status.replace('_', ' ')}`);
      fetchCycles();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to transition cycle');
    }
  };

  const getNextStatus = (current) => {
    const idx = cycleStatusOrder.indexOf(current);
    return idx >= 0 && idx < cycleStatusOrder.length - 1 ? cycleStatusOrder[idx + 1] : null;
  };

  // KPI summary by designation
  const kpisByDesignation = kpis.reduce((acc, k) => {
    const d = k.applicableDesignation || 'Unknown';
    if (!acc[d]) acc[d] = [];
    acc[d].push(k);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">HR Management</h1>
        <p className="text-slate-500 mt-1">Configure appraisal cycles, KPIs, and manage performance settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {['cycles', 'kpis'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${activeTab === tab ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'cycles' ? 'Appraisal Cycles' : 'Performance KPIs'}
          </button>
        ))}
      </div>

      {/* CYCLES TAB */}
      {activeTab === 'cycles' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={22} /> Appraisal Cycles
            </h2>
            <button
              onClick={() => setShowCycleForm(!showCycleForm)}
              className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-white font-semibold text-sm hover:bg-indigo-700 transition-all"
            >
              <Plus size={16} /> New Cycle
            </button>
          </div>

          {showCycleForm && (
            <form onSubmit={handleCreateCycle} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Cycle Name</label>
                <input required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                  value={newCycle.cycleName} onChange={e => setNewCycle(p => ({ ...p, cycleName: e.target.value }))} placeholder="Annual 2026" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Date</label>
                <input type="date" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newCycle.startDate} onChange={e => setNewCycle(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">End Date</label>
                <input type="date" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newCycle.endDate} onChange={e => setNewCycle(p => ({ ...p, endDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Self-Assessment Deadline</label>
                <input type="date" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newCycle.selfAssessmentDeadline} onChange={e => setNewCycle(p => ({ ...p, selfAssessmentDeadline: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Manager Review Deadline</label>
                <input type="date" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newCycle.managerAssessmentDeadline} onChange={e => setNewCycle(p => ({ ...p, managerAssessmentDeadline: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Committee Review Deadline</label>
                <input type="date" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newCycle.committeeReviewDeadline} onChange={e => setNewCycle(p => ({ ...p, committeeReviewDeadline: e.target.value }))} />
              </div>
              <div className="md:col-span-3 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCycleForm(false)} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-indigo-600 px-6 py-2 rounded-xl text-white font-semibold text-sm hover:bg-indigo-700">Create Cycle</button>
              </div>
            </form>
          )}

          {cycles.length === 0 ? (
            <p className="text-center py-10 text-slate-400 italic">No cycles created yet. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Cycle Name', 'Duration', 'Deadlines', 'Status', 'Actions'].map(h => (
                      <th key={h} className="py-3 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cycles.map(c => {
                    const next = getNextStatus(c.status);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-4 pr-4 font-bold text-slate-800">{c.cycleName}</td>
                        <td className="py-4 pr-4 text-sm text-slate-500 whitespace-nowrap">{c.startDate} → {c.endDate}</td>
                        <td className="py-4 pr-4 text-xs text-slate-400 space-y-0.5">
                          <p>Self: {c.selfAssessmentDeadline}</p>
                          <p>Mgr: {c.managerAssessmentDeadline}</p>
                          <p>Cmte: {c.committeeReviewDeadline}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusColors[c.status] || 'bg-slate-100 text-slate-500'}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-4 flex flex-wrap gap-2">
                          {c.status === 'DRAFT' && (
                            <button onClick={() => activateCycle(c.id)}
                              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-all">
                              Activate
                            </button>
                          )}
                          {next && c.status !== 'DRAFT' && c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (
                            <button onClick={() => transitionCycle(c.id, next)}
                              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                              <ChevronRight size={12} /> → {next.replace(/_/g, ' ')}
                            </button>
                          )}
                          {c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (
                            <button onClick={() => transitionCycle(c.id, 'CANCELLED')}
                              className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* KPIs TAB */}
      {activeTab === 'kpis' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Target className="text-indigo-600" size={22} /> Performance KPIs
            </h2>
            <button
              onClick={() => setShowKPIForm(!showKPIForm)}
              className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-white font-semibold text-sm hover:bg-indigo-700 transition-all"
            >
              <Plus size={16} /> Add KPI
            </button>
          </div>

          {showKPIForm && (
            <form onSubmit={handleCreateKPI} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">KPI Name</label>
                <input required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newKPI.kpiName} onChange={e => setNewKPI(p => ({ ...p, kpiName: e.target.value }))} placeholder="Software Delivery Speed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                <select className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newKPI.category} onChange={e => setNewKPI(p => ({ ...p, category: e.target.value }))}>
                  <option value="TECHNICAL">Technical</option>
                  <option value="SOFT_SKILL">Soft Skill</option>
                  <option value="MANAGERIAL">Managerial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Weightage (%)</label>
                <input type="number" min="1" max="100" required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newKPI.weightage} onChange={e => setNewKPI(p => ({ ...p, weightage: e.target.value }))} />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Applicable Designation</label>
                <input required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                  value={newKPI.applicableDesignation} onChange={e => setNewKPI(p => ({ ...p, applicableDesignation: e.target.value }))}
                  placeholder="e.g. Software Engineer" />
              </div>
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => setShowKPIForm(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 py-2 rounded-xl text-white font-semibold text-sm hover:bg-indigo-700">Add</button>
              </div>
            </form>
          )}

          {kpis.length === 0 ? (
            <p className="text-center py-10 text-slate-400 italic">No KPIs yet. Add some to get started.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(kpisByDesignation).map(([designation, dkpis]) => {
                const total = dkpis.reduce((s, k) => s + k.weightage, 0);
                return (
                  <div key={designation}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-700 text-sm">{designation}</h3>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${Math.abs(total - 100) < 0.01 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        Total weight: {total}% {Math.abs(total - 100) < 0.01 ? '✓' : '(should be 100%)'}
                      </span>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            {['KPI Name', 'Category', 'Weightage'].map(h => (
                              <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {dkpis.map(k => (
                            <tr key={k.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-semibold text-slate-800">{k.kpiName}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                  ${k.category === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' :
                                    k.category === 'SOFT_SKILL' ? 'bg-purple-100 text-purple-700' :
                                    'bg-amber-100 text-amber-700'}`}>
                                  {k.category?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-indigo-600">{k.weightage}%</span>
                                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${k.weightage}%` }} />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HRManagement;
