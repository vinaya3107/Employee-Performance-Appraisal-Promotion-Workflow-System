import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Users, ClipboardCheck, ArrowRight, Star, Send, User } from 'lucide-react';
import api from '../services/api';

const ManagerReviewPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selfAssessments, setSelfAssessments] = useState([]);
  const [managerRatings, setManagerRatings] = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        if (cycleRes.data.length > 0) {
          setActiveCycle(cycleRes.data[0]);
          const reportsRes = await api.get(`/users/${user.id}/direct-reports`);
          setReports(reportsRes.data);
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
      const saRes = await api.get(`/self-assessments/employee/${report.id}/cycle/${activeCycle.id}`);
      setSelfAssessments(saRes.data);
      
      const initial = {};
      saRes.data.forEach(sa => {
        initial[sa.kpi.id] = { managerRating: 3, managerComments: '' };
      });

      // Check if already reviewed
      const maRes = await api.get(`/manager-assessments/team/${user.id}/cycle/${activeCycle.id}`);
      const existing = maRes.data.filter(ma => ma.employee.id === report.id);
      if (existing.length > 0) {
        existing.forEach(ma => {
          initial[ma.kpi.id] = { id: ma.id, managerRating: ma.managerRating, managerComments: ma.managerComments };
        });
      }
      setManagerRatings(initial);
    } catch (err) {
      toast.error('Failed to load employee assessments');
    }
  };

  const submitReview = async () => {
    try {
      const promises = selfAssessments.map(sa => {
        const payload = {
          employee: { id: selectedReport.id },
          manager: { id: user.id },
          cycle: { id: activeCycle.id },
          kpi: { id: sa.kpi.id },
          managerRating: managerRatings[sa.kpi.id].managerRating,
          managerComments: managerRatings[sa.kpi.id].managerComments
        };
        return api.post('/manager-assessments', payload);
      });

      await Promise.all(promises);
      toast.success('Review submitted for ' + selectedReport.name);
      setSelectedReport(null);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600">Loading team data...</div>;

  return (
    <div className="space-y-8">
      {!selectedReport ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manager Review Panel</h1>
              <p className="text-slate-500 mt-1">Review and provide feedback for your direct reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{report.name}</h3>
                    <p className="text-xs text-slate-500">{report.designation}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => openReview(report)}
                  className="w-full py-3 bg-slate-50 rounded-xl text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Start Review
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <button onClick={() => setSelectedReport(null)} className="text-sm font-bold text-indigo-600 hover:underline">
              ← Back to Team
            </button>
            <button 
              onClick={submitReview}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition-all shadow-lg"
            >
              <Send size={18} />
              Finalize Review
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-6 flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
              {selectedReport.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedReport.name}</h2>
              <p className="text-slate-500">{selectedReport.designation} • {selectedReport.department}</p>
            </div>
          </div>

          <div className="space-y-6">
            {selfAssessments.map(sa => (
              <div key={sa.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Employee Side */}
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 opacity-80">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 block">KPI: {sa.kpi.kpiName}</span>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="text-amber-400 fill-amber-400" size={16} />
                    <span className="font-bold text-slate-900">Self Rating: {sa.selfRating}/5</span>
                  </div>
                  <p className="text-sm text-slate-600 italic">"{sa.selfComments || 'No comments provided'}"</p>
                </div>

                {/* Manager Side */}
                <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-sm ring-1 ring-indigo-50">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Your Assessment</span>
                   <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setManagerRatings({...managerRatings, [sa.kpi.id]: {...managerRatings[sa.kpi.id], managerRating: num}})}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                          managerRatings[sa.kpi.id]?.managerRating === num ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                   </div>
                   <textarea
                    className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Provide manager feedback..."
                    value={managerRatings[sa.kpi.id]?.managerComments}
                    onChange={(e) => setManagerRatings({...managerRatings, [sa.kpi.id]: {...managerRatings[sa.kpi.id], managerComments: e.target.value}})}
                   />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerReviewPanel;
