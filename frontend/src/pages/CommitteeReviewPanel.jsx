import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { ShieldCheck, CheckCircle2, TrendingUp, AlertCircle, Users } from 'lucide-react';
import api from '../services/api';

const CommitteeReviewPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [summaries, setSummaries] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [saving, setSaving] = useState(false);

  const [committeeForm, setCommitteeForm] = useState({
    finalRating: 3,
    promotionRecommendation: false,
    comments: '',
    overrideReason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const cycleRes = await api.get('/cycles/active');
      if (cycleRes.data?.length) {
        const cycle = cycleRes.data[0];
        setActiveCycle(cycle);
        const sumRes = await api.get(`/appraisal-summary/cycle/${cycle.id}`);
        setSummaries(sumRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openReview = (summary) => {
    setSelectedSummary(summary);
    // Pre-fill with manager score as starting point
    const mgr = summary.avgManagerScore || 0;
    setCommitteeForm({
      finalRating: Math.round(mgr) || 3,
      promotionRecommendation: mgr >= 4.0,
      comments: '',
      overrideReason: '',
    });
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!committeeForm.comments.trim()) {
      toast.error('Committee remarks are required');
      return;
    }
    // If overriding manager score significantly, require override reason
    const mgr = selectedSummary.avgManagerScore || 0;
    if (Math.abs(committeeForm.finalRating - mgr) >= 1 && !committeeForm.overrideReason.trim()) {
      toast.error('Override reason is required when changing rating by ≥1 from manager average');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee: { id: selectedSummary.employee.id },
        reviewer: { id: user.id },
        cycle: { id: activeCycle.id },
        finalRating: committeeForm.finalRating,
        promotionRecommendation: committeeForm.promotionRecommendation,
        comments: committeeForm.comments,
        overrideReason: committeeForm.overrideReason || null,
      };
      await api.post('/committee-reviews', payload);
      toast.success('Final review submitted!');
      setSelectedSummary(null);
      await loadData();
    } catch (err) {
      toast.error('Failed to submit committee review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!activeCycle) return (
    <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
      <AlertCircle size={40} className="mx-auto mb-3 text-amber-400" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Cycle</h2>
      <p className="text-slate-500">No appraisal cycle is currently active.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {!selectedSummary ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Committee Review Board</h1>
            <p className="text-slate-500 mt-1">
              Cycle: <strong>{activeCycle.cycleName}</strong> · {summaries.length} appraisal{summaries.length !== 1 ? 's' : ''} to review
            </p>
          </div>

          {summaries.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <Users size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 font-medium">No appraisal summaries yet.</p>
              <p className="text-slate-400 text-sm mt-1">Summaries appear after managers submit their assessments.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Employee', 'Manager Avg', 'Committee Score', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {summaries.map((s) => {
                    const mgrScore = s.avgManagerScore ?? 0;
                    const comScore = s.avgCommitteeScore ?? null;
                    const isEligible = s.promotionRecommended;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                              {s.employee?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{s.employee?.name}</p>
                              <p className="text-xs text-slate-500">{s.employee?.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-700">{mgrScore.toFixed(1)}</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(mgrScore / 5) * 100}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {comScore !== null && comScore !== mgrScore
                            ? <span className="font-bold text-purple-600">{comScore.toFixed(1)} <span className="text-xs text-slate-400">(overridden)</span></span>
                            : <span className="text-slate-400 text-sm">Not reviewed</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase
                            ${isEligible ? 'bg-emerald-100 text-emerald-700' :
                              s.overallRating === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'}`}>
                            {isEligible ? 'Eligible' : s.overallRating || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => openReview(s)} className="text-indigo-600 font-semibold text-sm hover:underline">
                            {comScore !== null ? 'Update' : 'Review'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedSummary(null)} className="mb-6 text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-2">
            ← Back to Board
          </button>

          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl space-y-8">
            <div className="text-center border-b border-slate-100 pb-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-100 mb-4">
                {selectedSummary.employee?.name?.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedSummary.employee?.name}</h2>
              <p className="text-slate-500">{selectedSummary.employee?.designation}</p>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <span className="text-slate-500">Manager Avg: <strong className="text-slate-800">{(selectedSummary.avgManagerScore ?? 0).toFixed(2)}</strong></span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${(selectedSummary.avgManagerScore ?? 0) >= 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {(selectedSummary.avgManagerScore ?? 0) >= 4 ? 'Meets promotion threshold' : 'Below threshold (4.0)'}
                </span>
              </div>
            </div>

            <form onSubmit={handleReview} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Final Rating (1–5)</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num} type="button"
                      onClick={() => setCommitteeForm(p => ({ ...p, finalRating: num, promotionRecommendation: num >= 4 }))}
                      className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all
                        ${committeeForm.finalRating === num ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  {committeeForm.finalRating >= 4 ? '✓ Meets promotion threshold (≥4.0)' : '✗ Below promotion threshold (4.0)'}
                </p>
              </div>

              {/* Override reason if changing significantly */}
              {Math.abs(committeeForm.finalRating - (selectedSummary.avgManagerScore ?? 0)) >= 1 && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Override Reason <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-slate-400 ml-2">(required: rating differs from manager avg by ≥1)</span>
                  </label>
                  <textarea
                    className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm resize-none"
                    placeholder="Explain why you are overriding the manager's rating..."
                    value={committeeForm.overrideReason}
                    onChange={(e) => setCommitteeForm(p => ({ ...p, overrideReason: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Recommend Promotion
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-set based on rating ≥ 4.0</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={committeeForm.promotionRecommendation}
                    onChange={(e) => setCommitteeForm(p => ({ ...p, promotionRecommendation: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Committee Remarks <span className="text-red-500">*</span></label>
                <textarea
                  required
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm resize-none"
                  placeholder="Justify the final score and promotion decision..."
                  value={committeeForm.comments}
                  onChange={(e) => setCommitteeForm(p => ({ ...p, comments: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <ShieldCheck size={18} /> Submit Final Decision
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeReviewPanel;
