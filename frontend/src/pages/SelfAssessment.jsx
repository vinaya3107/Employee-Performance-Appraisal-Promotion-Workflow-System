import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Save, Send, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ratingLabels = { 1: 'Poor', 2: 'Below Average', 3: 'Average', 4: 'Good', 5: 'Outstanding' };

const SelfAssessment = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        if (!cycleRes.data?.length) { setLoading(false); return; }
        const cycle = cycleRes.data[0];
        setActiveCycle(cycle);

        const kpiRes = await api.get(`/kpis/designation/${user.designation}`);
        const kpiList = kpiRes.data || [];
        setKpis(kpiList);

        // Build initial state
        const initial = {};
        kpiList.forEach(kpi => {
          initial[kpi.id] = { selfRating: 3, selfComments: '', status: 'DRAFT', id: null };
        });

        // Load existing assessments
        try {
          const existingRes = await api.get(`/self-assessments/employee/${user.id}/cycle/${cycle.id}`);
          (existingRes.data || []).forEach(sa => {
            initial[sa.kpi.id] = {
              id: sa.id,
              selfRating: sa.selfRating,
              selfComments: sa.selfComments || '',
              status: sa.status,
            };
          });
        } catch (_) {}

        setAssessments(initial);
      } catch (err) {
        console.error('Data loading error:', err.response?.data || err.message);
        toast.error('Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRatingChange = (kpiId, val) => {
    setAssessments(prev => ({ ...prev, [kpiId]: { ...prev[kpiId], selfRating: val } }));
  };

  const handleCommentChange = (kpiId, val) => {
    setAssessments(prev => ({ ...prev, [kpiId]: { ...prev[kpiId], selfComments: val } }));
  };

  const saveAssessment = async (isSubmit = false) => {
    // Validate: if rating <= 2, comment is required
    for (const kpi of kpis) {
      const a = assessments[kpi.id];
      if (a?.selfRating <= 2 && !a?.selfComments?.trim()) {
        toast.error(`Comment required for "${kpi.kpiName}" (rating ≤ 2)`);
        return;
      }
    }

    setSaving(true);
    try {
      const savedIds = {};
      for (const kpi of kpis) {
        const existing = assessments[kpi.id];
        const payload = {
          employee: { id: user.id },
          cycle: { id: activeCycle.id },
          kpi: { id: kpi.id },
          selfRating: existing.selfRating,
          selfComments: existing.selfComments,
          status: 'DRAFT',
        };
        if (existing.id) payload.id = existing.id;

        const res = await api.post('/self-assessments', payload);
        savedIds[kpi.id] = res.data.id;
      }

      // Update local state with saved ids
      setAssessments(prev => {
        const updated = { ...prev };
        kpis.forEach(kpi => {
          updated[kpi.id] = { ...updated[kpi.id], id: savedIds[kpi.id] };
        });
        return updated;
      });

      if (isSubmit) {
        for (const kpi of kpis) {
          const id = savedIds[kpi.id] || assessments[kpi.id]?.id;
          if (id) await api.put(`/self-assessments/${id}/submit`);
        }
        setAssessments(prev => {
          const updated = { ...prev };
          kpis.forEach(kpi => { updated[kpi.id] = { ...updated[kpi.id], status: 'SUBMITTED' }; });
          return updated;
        });
        toast.success('Assessment submitted successfully!');
      } else {
        toast.success('Progress saved as draft');
      }
    } catch (err) {
      console.error('Self-assessment save error:', err.response?.data || err.message);
      toast.error(`Failed to save assessment: ${err.response?.data || 'Check that the cycle is in the correct stage.'}`);
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
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Appraisal Cycle</h2>
      <p className="text-slate-500">Please wait for HR to start a new cycle.</p>
    </div>
  );

  if (kpis.length === 0) return (
    <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-6">
        <Info size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No KPIs Assigned</h2>
      <p className="text-slate-500">No KPIs found for designation <strong>{user.designation}</strong>. Ask HR to add KPIs.</p>
    </div>
  );

  const isAlreadySubmitted = kpis.length > 0 && kpis.every(k => assessments[k.id]?.status === 'SUBMITTED');
  const totalWeight = kpis.reduce((s, k) => s + (k.weightage || 0), 0);
  const weightedScore = kpis.reduce((s, k) => {
    const a = assessments[k.id];
    return s + (a?.selfRating || 0) * (k.weightage || 0);
  }, 0);
  const previewScore = totalWeight > 0 ? (weightedScore / totalWeight).toFixed(2) : '—';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Self Assessment</h1>
          <p className="text-slate-500 mt-1">Cycle: <strong>{activeCycle.cycleName}</strong> · Deadline: {activeCycle.selfAssessmentDeadline}</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-right">
            <p className="text-xs text-slate-400">Weighted preview score</p>
            <p className="text-2xl font-bold text-indigo-600">{previewScore}<span className="text-base text-slate-400">/5</span></p>
          </div>
          {!isAlreadySubmitted && (
            <>
              <button
                onClick={() => saveAssessment(false)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                onClick={() => saveAssessment(true)}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-60"
              >
                <Send size={16} /> Submit Final
              </button>
            </>
          )}
        </div>
      </div>

      {isAlreadySubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
          <CheckCircle2 size={20} />
          <p className="text-sm font-semibold">Assessment submitted. It cannot be modified further.</p>
        </div>
      )}

      <div className="space-y-6">
        {kpis.map((kpi) => {
          const a = assessments[kpi.id] || {};
          const submitted = a.status === 'SUBMITTED';
          return (
            <div key={kpi.id} className={`bg-white p-8 rounded-3xl border shadow-sm space-y-5 transition-all ${submitted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${kpi.category === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' :
                        kpi.category === 'SOFT_SKILL' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'}`}>
                      {kpi.category?.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">Weight: {kpi.weightage}%</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{kpi.kpiName}</h3>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      disabled={submitted || isAlreadySubmitted}
                      onClick={() => handleRatingChange(kpi.id, num)}
                      title={ratingLabels[num]}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all text-sm
                        ${a.selfRating === num
                          ? 'bg-indigo-600 text-white shadow-md scale-110'
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        } disabled:cursor-not-allowed`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {a.selfRating && (
                <p className="text-xs font-semibold text-indigo-600">
                  Rating: {a.selfRating} — {ratingLabels[a.selfRating]}
                  {a.selfRating <= 2 && <span className="text-red-500 ml-2">* Comment required</span>}
                </p>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Comments {a.selfRating <= 2 ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">(optional)</span>}
                </label>
                <textarea
                  value={a.selfComments || ''}
                  disabled={submitted || isAlreadySubmitted}
                  onChange={(e) => handleCommentChange(kpi.id, e.target.value)}
                  placeholder="Describe your achievements and challenges for this KPI..."
                  className="w-full h-28 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all disabled:opacity-60 text-sm"
                />
              </div>

              {submitted && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                  <CheckCircle2 size={16} /> Submitted
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isAlreadySubmitted && kpis.length > 0 && (
        <div className="flex justify-end gap-3 pb-8">
          <button onClick={() => saveAssessment(false)} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50">
            <Save size={16} /> Save Draft
          </button>
          <button onClick={() => saveAssessment(true)} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-60">
            <Send size={16} /> Submit Final Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default SelfAssessment;
