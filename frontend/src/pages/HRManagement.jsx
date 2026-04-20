import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Target, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import api from '../services/api';

const HRManagement = () => {
  const [cycles, setCycles] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [showKPIForm, setShowKPIForm] = useState(false);

  const [newCycle, setNewCycle] = useState({
    cycleName: '',
    startDate: '',
    endDate: '',
    selfAssessmentDeadline: '',
    managerAssessmentDeadline: '',
    committeeReviewDeadline: '',
    status: 'DRAFT'
  });

  const [newKPI, setNewKPI] = useState({
    kpiName: '',
    category: 'TECHNICAL',
    weightage: 20,
    applicableDesignation: ''
  });

  useEffect(() => {
    fetchCycles();
    fetchKPIs();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get('/cycles');
      setCycles(res.data);
    } catch (err) {
      toast.error('Failed to load cycles');
    }
  };

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/kpis');
      setKpis(res.data);
    } catch (err) {
      toast.error('Failed to load KPIs');
    }
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cycles', newCycle);
      toast.success('Appraisal cycle created!');
      setShowCycleForm(false);
      fetchCycles();
    } catch (err) {
      toast.error('Failed to create cycle');
    }
  };

  const handleCreateKPI = async (e) => {
    e.preventDefault();
    try {
      await api.post('/kpis', newKPI);
      toast.success('KPI added successfully!');
      setShowKPIForm(false);
      fetchKPIs();
    } catch (err) {
      toast.error('Failed to add KPI');
    }
  };

  const activateCycle = async (id) => {
    try {
      await api.put(`/cycles/${id}/activate`);
      toast.success('Cycle activated!');
      fetchCycles();
    } catch (err) {
      toast.error('Failed to activate');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">HR Management</h1>
          <p className="text-slate-500 mt-1">Configure appraisal cycles and global performance targets.</p>
        </div>
      </div>

      {/* Cycle Management Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} />
            Appraisal Cycles
          </h2>
          <button 
            onClick={() => setShowCycleForm(!showCycleForm)}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-white font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} />
            New Cycle
          </button>
        </div>

        {showCycleForm && (
          <form onSubmit={handleCreateCycle} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cycle Name</label>
              <input 
                required 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={newCycle.cycleName}
                onChange={e => setNewCycle({...newCycle, cycleName: e.target.value})}
                placeholder="Annual 2026"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Start Date</label>
              <input type="date" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newCycle.startDate} onChange={e => setNewCycle({...newCycle, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">End Date</label>
              <input type="date" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newCycle.endDate} onChange={e => setNewCycle({...newCycle, endDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Self Assessment Deadline</label>
              <input type="date" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newCycle.selfAssessmentDeadline} onChange={e => setNewCycle({...newCycle, selfAssessmentDeadline: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Manager Deadline</label>
              <input type="date" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newCycle.managerAssessmentDeadline} onChange={e => setNewCycle({...newCycle, managerAssessmentDeadline: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Committee Deadline</label>
              <input type="date" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newCycle.committeeReviewDeadline} onChange={e => setNewCycle({...newCycle, committeeReviewDeadline: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-indigo-600 px-8 py-2 rounded-xl text-white font-bold">Create Cycle</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-4 text-sm font-bold text-slate-900">Cycle Name</th>
                <th className="py-4 text-sm font-bold text-slate-900">Duration</th>
                <th className="py-4 text-sm font-bold text-slate-900">Status</th>
                <th className="py-4 text-sm font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cycles.map(c => (
                <tr key={c.id}>
                  <td className="py-4 font-bold text-slate-700">{c.cycleName}</td>
                  <td className="py-4 text-sm text-slate-500">{c.startDate} - {c.endDate}</td>
                  <td className="py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {c.status === 'DRAFT' && (
                      <button 
                        onClick={() => activateCycle(c.id)}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Management Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-indigo-600" size={24} />
            Performance KPIs
          </h2>
          <button 
             onClick={() => setShowKPIForm(!showKPIForm)}
            className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-white font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} />
            Add KPI
          </button>
        </div>

        {showKPIForm && (
          <form onSubmit={handleCreateKPI} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">KPI Name</label>
              <input 
                required 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={newKPI.kpiName}
                onChange={e => setNewKPI({...newKPI, kpiName: e.target.value})}
                placeholder="Software Delivery Speed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
              <select className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newKPI.category} onChange={e => setNewKPI({...newKPI, category: e.target.value})}>
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILL">Soft Skill</option>
                <option value="MANAGERIAL">Managerial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Weight (%)</label>
              <input type="number" required className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl" value={newKPI.weightage} onChange={e => setNewKPI({...newKPI, weightage: e.target.value})} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Applicable Designation</label>
              <input 
                required 
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
                value={newKPI.applicableDesignation}
                onChange={e => setNewKPI({...newKPI, applicableDesignation: e.target.value})}
                placeholder="Software Engineer"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-indigo-600 py-2 rounded-xl text-white font-bold">Add KPI</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="py-4 text-sm font-bold text-slate-900">KPI Name</th>
                <th className="py-4 text-sm font-bold text-slate-900">Category</th>
                <th className="py-4 text-sm font-bold text-slate-900">Weight</th>
                <th className="py-4 text-sm font-bold text-slate-900">Designation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {kpis.map(k => (
                <tr key={k.id}>
                  <td className="py-4 font-bold text-slate-700">{k.kpiName}</td>
                  <td className="py-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase">
                      {k.category}
                    </span>
                  </td>
                  <td className="py-4 font-medium text-indigo-600">{k.weightage}%</td>
                  <td className="py-4 text-slate-500">{k.applicableDesignation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
