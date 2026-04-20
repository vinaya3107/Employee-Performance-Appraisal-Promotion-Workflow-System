import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Save, Send, AlertCircle, Info, Star } from 'lucide-react';
import api from '../services/api';

const SelfAssessment = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        if (cycleRes.data.length > 0) {
          const cycle = cycleRes.data[0];
          setActiveCycle(cycle);

          const kpiRes = await api.get(`/kpis/designation/${user.designation}`);
          setKpis(kpiRes.data);

          // Build initial state for assessments
          const initial = {};
          kpiRes.data.forEach(kpi => {
            initial[kpi.id] = { selfRating: 3, selfComments: '' };
          });
          setAssessments(initial);

          // Check for existing drafts
          const existingRes = await api.get(`/self-assessments/employee/${user.id}/cycle/${cycle.id}`);
          if (existingRes.data.length > 0) {
            const existingMap = {};
            existingRes.data.forEach(sa => {
              existingMap[sa.kpi.id] = { id: sa.id, selfRating: sa.selfRating, selfComments: sa.selfComments, status: sa.status };
            });
            setAssessments(prev => ({ ...prev, ...existingMap }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch assessment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRatingChange = (kpiId, val) => {
    setAssessments(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], selfRating: val }
    }));
  };

  const handleCommentChange = (kpiId, val) => {
    setAssessments(prev => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], selfComments: val }
    }));
  };

  const saveAssessment = async (isSubmit = false) => {
    try {
      const promises = kpis.map(kpi => {
        const payload = {
          id: assessments[kpi.id]?.id,
          employee: { id: user.id },
          cycle: { id: activeCycle.id },
          kpi: { id: kpi.id },
          selfRating: assessments[kpi.id].selfRating,
          selfComments: assessments[kpi.id].selfComments,
          status: 'DRAFT'
        };
        return api.post('/self-assessments', payload);
      });

      const results = await Promise.all(promises);
      
      if (isSubmit) {
        await Promise.all(results.map(res => api.put(`/self-assessments/${res.data.id}/submit`)));
        toast.success('Assessment submitted successfully!');
      } else {
        toast.success('Progress saved as draft');
      }
      
      // Refresh IDs in local state
      const updatedMap = { ...assessments };
      results.forEach((res, index) => {
        updatedMap[kpis[index].id].id = res.data.id;
        if (isSubmit) updatedMap[kpis[index].id].status = 'SUBMITTED';
      });
      setAssessments(updatedMap);

    } catch (err) {
      toast.error('Failed to save assessment');
    }
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse text-indigo-600 font-bold">Loading assessment details...</div>;

  if (!activeCycle) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Appraisal Cycle</h2>
        <p className="text-slate-500">There are no active appraisal cycles currently. Please wait for the HR department to start a new cycle.</p>
      </div>
    );
  }

  const isAlreadySubmitted = Object.values(assessments).some(a => a.status === 'SUBMITTED');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Self Assessment</h1>
          <p className="text-slate-500 mt-1">Review your performance for the {activeCycle.cycleName} cycle.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => saveAssessment(false)} 
            disabled={isAlreadySubmitted}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            Save Draft
          </button>
          <button 
            onClick={() => saveAssessment(true)}
            disabled={isAlreadySubmitted}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none"
          >
            <Send size={18} />
            Submit Final
          </button>
        </div>
      </div>

      {isAlreadySubmitted && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-800">
          <Info size={20} />
          <p className="text-sm font-medium">This assessment has already been submitted and cannot be modified.</p>
        </div>
      )}

      <div className="space-y-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider mb-2">
                  {kpi.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{kpi.kpiName}</h3>
                <p className="text-sm text-slate-500">Weightage: {kpi.weightage}%</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    disabled={isAlreadySubmitted}
                    onClick={() => handleRatingChange(kpi.id, num)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                      assessments[kpi.id]?.selfRating === num
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Self Comments</label>
              <textarea
                value={assessments[kpi.id]?.selfComments}
                disabled={isAlreadySubmitted}
                onChange={(e) => handleCommentChange(kpi.id, e.target.value)}
                placeholder="Describe your achievements and challenges related to this KPI..."
                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all disabled:opacity-75"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelfAssessment;
