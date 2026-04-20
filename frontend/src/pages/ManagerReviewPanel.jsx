import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Users, ArrowRight, Star, Send, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const ratingLabels = { 1: 'Poor', 2: 'Below Avg', 3: 'Average', 4: 'Good', 5: 'Outstanding' };

const ManagerReviewPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selfAssessments, setSelfAssessments] = useState([]);
  const [managerRatings, setManagerRatings] = useState({});
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        if (cycleRes.data?.length) {
          const cycle = cycleRes.data[0];
          setActiveCycle(cycle);
          const reportsRes = await api.get(`/users/${user.id}/direct-reports`);
          setReports(reportsRes.data || []);
        }
      } catch (err) {
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const openReview = async (report) => {
    try {
      setSelectedReport(report);
      setSelfAssessments([]);
      setManagerRatings({});
      setAlreadyReviewed(false);

      const saRes = await api.get(`/self-assessments/employee/${report.id}/cycle/${activeCycle.id}`);
      const saList = saRes.data || [];
      setSelfAssessments(saList);

      const initial = {};
      saList.forEach(sa => {
        initial[sa.kpi.id] = { managerRating: 3, managerComment: '', kpiId: sa.kpi.id };
      });

      // Check existing manager assessments
      try {
        const maRes = await api.get(`/manager-assessments/employee/${report.id}/cycle/${activeCycle.id}`);
        const existing = maRes.data || [];
        if (existing.length > 0) {
          setAlreadyReviewed(true);
          existing.forEach(ma => {
            initial[ma.kpi.id] = {
              id: ma.id,
              managerRating: ma.managerRating,
              managerComment: ma.managerComment || '',
              kpiId: ma.kpi.id,
            };
          });
        }
      } catch (_) {}

      setManagerRatings(initial);
    } catch (err) {
      toast.error('Failed to load employee assessments. Ensure they have submitted their self-assessment.');
    }
  };

  const updateRating = (kpiId, field, value) => {
    setManagerRatings(prev => ({ ...prev, [kpiId]: { ...prev[kpiId], [field]: value } }));
  };

  const submitReview = async () => {
    // Validate
    for (const sa of selfAssessments) {
      const r = managerRatings[sa.kpi.id];
      if (!r) continue;
      if (r.managerRating <= 2 && !r.managerComment?.trim()) {
        toast.error(`Comment required for "${sa.kpi.kpiName}" (rating ≤ 2)`);
        return;
      }
    }

    setSaving(true);
    try {
      for (const sa of selfAssessments) {
        const r = managerRatings[sa.kpi.id];
        if (!r) continue;
        const payload = {
          employee: { id: selectedReport.id },
          manager: { id: user.id },
          cycle: { id: activeCycle.id },
          kpi: { id: sa.kpi.id },
          managerRating: r.managerRating,
          managerComment: r.managerComment || '',
        };
        if (r.id) payload.id = r.id;
        await api.post('/manager-assessments', payload);
      }
      toast.success(`Review submitted for ${selectedReport.name}`);
      setSelectedReport(null);
    } catch (err) {
      toast.error('Failed to submit review');
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
      {!selectedReport ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Manager Review Panel</h1>
            <p className="text-slate-500 mt-1">Review and rate your {reports.length} direct report{reports.length !== 1 ? 's' : ''}.</p>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <Users size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No direct reports assigned to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {report.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{report.name}</h3>
                      <p className="text-xs text-slate-500">{report.designation}</p>
                      <p className="text-xs text-slate-400">{report.department}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openReview(report)}
                    className="w-full py-2.5 bg-slate-50 rounded-xl text-indigo-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    Review <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button onClick={() => setSelectedReport(null)} className="text-sm font-semibold text-indigo-600 hover:underline">
              ← Back to Team
            </button>
            <button
              onClick={submitReview}
              disabled={saving || selfAssessments.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
            >
              <Send size={16} />
              {alreadyReviewed ? 'Update Review' : 'Submit Review'}
            </button>
          </div>

          {/* Employee header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              {selectedReport.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedReport.name}</h2>
              <p className="text-slate-500">{selectedReport.designation} · {selectedReport.department}</p>
            </div>
            {alreadyReviewed && (
              <div className="ml-auto flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                <CheckCircle2 size={16} /> Already reviewed — you can update
              </div>
            )}
          </div>

          {selfAssessments.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-medium">This employee hasn't submitted their self-assessment yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {selfAssessments.map(sa => {
                const r = managerRatings[sa.kpi.id] || {};
                return (
                  <div key={sa.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employee self-assessment */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                          ${sa.kpi.category === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' :
                            sa.kpi.category === 'SOFT_SKILL' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-700'}`}>
                          {sa.kpi.category?.replace('_',' ')}
                        </span>
                        <span className="text-xs text-slate-400">Weight: {sa.kpi.weightage}%</span>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-3">{sa.kpi.kpiName}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="text-amber-400 fill-amber-400" size={16} />
                        <span className="font-bold text-slate-700">Self: {sa.selfRating}/5 — {ratingLabels[sa.selfRating]}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic bg-white rounded-xl p-3 border border-slate-100">
                        "{sa.selfComments || 'No comments provided'}"
                      </p>
                    </div>

                    {/* Manager rating */}
                    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Your Assessment</p>
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map(num => (
                          <button
                            key={num}
                            title={ratingLabels[num]}
                            onClick={() => updateRating(sa.kpi.id, 'managerRating', num)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all
                              ${r.managerRating === num ? 'bg-indigo-600 text-white scale-110 shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      {r.managerRating && (
                        <p className="text-xs font-semibold text-indigo-600 mb-2">
                          {r.managerRating}/5 — {ratingLabels[r.managerRating]}
                          {r.managerRating <= 2 && <span className="text-red-500 ml-2">* Comment required</span>}
                        </p>
                      )}
                      <textarea
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
                        placeholder="Provide your manager feedback..."
                        value={r.managerComment || ''}
                        onChange={(e) => updateRating(sa.kpi.id, 'managerComment', e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManagerReviewPanel;
