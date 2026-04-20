import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Award, DollarSign, Briefcase, ChevronRight, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';

const PromotionBoard = () => {
  const { user } = useSelector((state) => state.auth);
  const [eligibleList, setEligibleList] = useState([]);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('eligible');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [promoForm, setPromoForm] = useState({ newDesignation: '', newSalary: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eligRes = await api.get('/promotions/eligible');
      setEligibleList(eligRes.data || []);
      const histRes = await api.get('/promotions/all');
      setPromotionHistory(histRes.data || []);
    } catch { toast.error('Failed to load promotion data'); }
    setLoading(false);
  };

  const selectCandidate = (summary) => {
    setSelectedEmp(summary);
    setPromoForm({ newDesignation: '', newSalary: '' });
  };

  const finalizePromotion = async (e) => {
    e.preventDefault();
    const salary = parseFloat(promoForm.newSalary);
    if (isNaN(salary) || salary <= 0) {
      toast.error('Please enter a valid salary');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee: { id: selectedEmp.employee.id },
        cycle: { id: selectedEmp.cycle.id },
        oldDesignation: selectedEmp.employee.designation,
        newDesignation: promoForm.newDesignation,
        newSalary: salary,
        approvedBy: { id: user.id },
      };
      await api.post('/promotions/approve', payload);
      toast.success(`Promotion approved for ${selectedEmp.employee.name}!`);
      setSelectedEmp(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to approve promotion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Promotion Approval Board</h1>
        <p className="text-slate-500 mt-1">Finalize designation changes and salary updates for top performers.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {['eligible', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${activeTab === tab ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'eligible' ? `Eligible (${eligibleList.length})` : 'History'}
          </button>
        ))}
      </div>

      {activeTab === 'eligible' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: candidate list */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Award className="text-amber-500" size={20} /> Eligible Candidates
            </h3>
            {eligibleList.length === 0 ? (
              <div className="text-center py-10">
                <Award size={48} className="mx-auto mb-3 text-slate-200" />
                <p className="text-slate-400 italic">No pending promotion recommendations.</p>
                <p className="text-slate-300 text-sm mt-1">Committee must recommend employees with final score ≥ 4.0</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleList.map(summary => (
                  <button
                    key={summary.id}
                    onClick={() => selectCandidate(summary)}
                    className={`w-full p-5 rounded-2xl border text-left transition-all
                      ${selectedEmp?.id === summary.id
                        ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-400'
                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm font-bold text-sm border border-slate-100">
                          {summary.employee?.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{summary.employee?.name}</h4>
                          <p className="text-xs text-slate-500">{summary.employee?.designation} · {summary.employee?.department}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-indigo-600">
                          Score: {(summary.avgCommitteeScore ?? summary.avgManagerScore ?? 0).toFixed(1)}
                        </span>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: promotion form */}
          <div>
            {selectedEmp ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 space-y-7 sticky top-8">
                <div className="text-center pb-6 border-b border-slate-50">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {selectedEmp.employee?.name?.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedEmp.employee?.name}</h3>
                  <p className="text-slate-500 text-sm">{selectedEmp.employee?.designation}</p>
                  <div className="flex justify-center gap-4 mt-3 text-xs text-slate-400">
                    <span>Dept: {selectedEmp.employee?.department || 'N/A'}</span>
                    <span>Score: <strong className="text-indigo-600">{(selectedEmp.avgCommitteeScore ?? selectedEmp.avgManagerScore ?? 0).toFixed(2)}</strong></span>
                  </div>
                </div>

                <form onSubmit={finalizePromotion} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Current Designation</label>
                    <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                      {selectedEmp.employee?.designation}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Designation <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        placeholder="e.g. Senior Software Engineer"
                        value={promoForm.newDesignation}
                        onChange={e => setPromoForm(p => ({ ...p, newDesignation: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Annual Salary <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="number" required min="1"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                        placeholder="e.g. 1200000"
                        value={promoForm.newSalary}
                        onChange={e => setPromoForm(p => ({ ...p, newSalary: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={saving}
                    className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <CheckCircle2 size={18} />
                    {saving ? 'Approving...' : 'Approve Promotion'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <TrendingUp size={48} className="mb-4 text-slate-200" />
                <p className="text-slate-400 font-medium">Select a candidate to finalize their promotion.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" /> Approved Promotions
            </h3>
            <p className="text-slate-500 text-sm mt-1">Review the history of finalized career advancements.</p>
          </div>
          
          {promotionHistory.length === 0 ? (
            <div className="p-16 text-center">
              <Clock size={40} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 italic">No promotion history found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-8 py-4">Employee</th>
                    <th className="px-8 py-4">Designation Change</th>
                    <th className="px-8 py-4">New Salary</th>
                    <th className="px-8 py-4">Effective Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {promotionHistory.map(promo => (
                    <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {promo.employee?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{promo.employee?.name}</p>
                            <p className="text-xs text-slate-400">{promo.employee?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-400 line-through">{promo.oldDesignation}</span>
                          <ChevronRight size={12} className="text-slate-300" />
                          <span className="text-emerald-600 font-bold">{promo.newDesignation}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-semibold text-slate-700">
                        ₹{promo.newSalary?.toLocaleString()}
                      </td>
                      <td className="px-8 py-4 text-xs text-slate-500">
                        {new Date(promo.effectiveDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionBoard;
