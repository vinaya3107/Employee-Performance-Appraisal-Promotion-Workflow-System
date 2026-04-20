import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Award, DollarSign, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const PromotionBoard = () => {
  const [eligibleList, setEligibleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [promoForm, setPromoForm] = useState({
    newDesignation: '',
    newSalary: ''
  });

  useEffect(() => {
    fetchEligible();
  }, []);

  const fetchEligible = async () => {
    try {
      const res = await api.get('/promotions/eligible');
      setEligibleList(res.data);
    } catch (err) {
      toast.error('Failed to load eligible list');
    } finally {
      setLoading(false);
    }
  };

  const finalizePromotion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee: { id: selectedEmp.employee.id },
        cycle: { id: selectedEmp.cycle.id },
        oldDesignation: selectedEmp.employee.designation,
        newDesignation: promoForm.newDesignation,
        newSalary: parseFloat(promoForm.newSalary)
      };
      await api.post('/promotions/approve', payload);
      toast.success('Promotion finalized for ' + selectedEmp.employee.name);
      setSelectedEmp(null);
      fetchEligible();
    } catch (err) {
      toast.error('Failed to finalize promotion');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-600">Loading promotion board...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Promotion Approval Board</h1>
          <p className="text-slate-500 mt-1">Finalize designation changes and salary updates for top performers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 h-fit">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="text-amber-500" size={24} />
            Eligible for Promotion
          </h3>
          
          {eligibleList.length === 0 ? (
            <p className="text-slate-500 text-center py-10 italic">No pending promotion recommendations.</p>
          ) : (
            <div className="space-y-4">
              {eligibleList.map(summary => (
                <button
                  key={summary.id}
                  onClick={() => setSelectedEmp(summary)}
                  className={`w-full p-6 rounded-2xl border text-left transition-all ${
                    selectedEmp?.id === summary.id 
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' 
                    : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm font-bold">
                        {summary.employee.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{summary.employee.name}</h4>
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">{summary.employee.designation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-bold text-indigo-600">Score: {summary.avgCommitteeScore.toFixed(1)}</p>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedEmp ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 space-y-8 sticky top-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="text-center pb-6 border-b border-slate-50">
                  <h3 className="text-2xl font-bold text-slate-900">Finalize Promotion</h3>
                  <p className="text-slate-500">Processing designation for {selectedEmp.employee.name}</p>
               </div>

               <form onSubmit={finalizePromotion} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Designation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Briefcase size={18} />
                    </div>
                    <input 
                      required 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. Senior Software Engineer"
                      value={promoForm.newDesignation}
                      onChange={e => setPromoForm({...promoForm, newDesignation: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Annual Salary</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <DollarSign size={18} />
                    </div>
                    <input 
                      type="number"
                      required 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g. 120000"
                      value={promoForm.newSalary}
                      onChange={e => setPromoForm({...promoForm, newSalary: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Approve Designation Change
                </button>
               </form>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[400px]">
               <Award size={48} className="mb-4 opacity-20" />
               <p className="font-medium">Select an eligible candidate from the list to finalize their promotion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionBoard;
