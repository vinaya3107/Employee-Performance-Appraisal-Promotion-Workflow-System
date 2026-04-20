import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { ShieldCheck, CheckCircle2, XCircle, Search, User, TrendingUp } from 'lucide-react';
import api from '../services/api';

const CommitteeReviewPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [summaries, setSummaries] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  
  const [committeeForm, setCommitteeForm] = useState({
    finalRating: 3,
    promotionRecommendation: false,
    comments: ''
  });

  useEffect(() => {
    const fetchActiveCycle = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        if (cycleRes.data.length > 0) {
          const cycle = cycleRes.data[0];
          setActiveCycle(cycle);
          const summariesRes = await api.get(`/appraisal-summary/cycle/${cycle.id}`);
          setSummaries(summariesRes.data);
        }
      } catch (err) {
        toast.error('Failed to load summary data');
      } finally {
        setLoading(false);
      }
    };
    fetchActiveCycle();
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: selectedSummary.employee.id },
        reviewer: { id: user.id },
        cycle: { id: activeCycle.id },
        ...committeeForm
      };
      await api.post('/committee-reviews', payload);
      toast.success('Final review submitted!');
      setSelectedSummary(null);
      // Refresh summaries
      const summariesRes = await api.get(`/appraisal-summary/cycle/${activeCycle.id}`);
      setSummaries(summariesRes.data);
    } catch (err) {
      toast.error('Failed to submit committee review');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600">Loading committee board...</div>;

  return (
    <div className="space-y-8">
      {!selectedSummary ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Committee Review Board</h1>
              <p className="text-slate-500 mt-1">Moderate manager ratings and finalize promotion eligibility.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Manager Avg</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Eligibility</th>
                  <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                          {s.employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.employee.name}</p>
                          <p className="text-xs text-slate-500">{s.employee.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                         <div className="text-lg font-bold text-slate-700">{s.avgManagerScore.toFixed(1)}</div>
                         <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{width: `${(s.avgManagerScore/5)*100}%`}}></div>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        s.promotionRecommended 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : s.overallRating === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {s.promotionRecommended ? 'Eligible' : s.overallRating}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => setSelectedSummary(s)}
                        className="text-indigo-600 font-bold text-sm hover:underline"
                      >
                        Finalize Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setSelectedSummary(null)} className="mb-6 text-sm font-bold text-indigo-600 hover:underline flex items-center gap-2">
             ← Back to Board
          </button>

          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl space-y-8">
            <div className="text-center border-b border-slate-100 pb-8">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-100 mb-4">
                {selectedSummary.employee.name.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedSummary.employee.name}</h2>
              <p className="text-slate-500">{selectedSummary.employee.designation} • Manager Avg: {selectedSummary.avgManagerScore.toFixed(2)}</p>
            </div>

            <form onSubmit={handleReview} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Final Committee Rating (1–5)</label>
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCommitteeForm({...committeeForm, finalRating: num})}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all ${
                        committeeForm.finalRating === num ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-600" />
                    Recommend Promotion
                  </h4>
                  <p className="text-xs text-slate-500">Enable this if the criteria match company policy.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={committeeForm.promotionRecommendation}
                    onChange={(e) => setCommitteeForm({...committeeForm, promotionRecommendation: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Committee Remarks</label>
                <textarea
                  required
                  className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Justification for final score and promotion decision..."
                  value={committeeForm.comments}
                  onChange={(e) => setCommitteeForm({...committeeForm, comments: e.target.value})}
                />
              </div>

              <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">
                Submit Final Decision
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeReviewPanel;
