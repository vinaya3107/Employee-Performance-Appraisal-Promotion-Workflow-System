import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Star,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cycleRes, reportsRes] = await Promise.all([
        api.get('/cycles/active'),
        api.get(`/users/${user.id}/direct-reports`)
      ]);
      
      const cycle = cycleRes.data?.[0];
      setActiveCycle(cycle);
      
      // Fetch assessment status for each report if cycle exists
      const reportsWithStatus = await Promise.all((reportsRes.data || []).map(async (report) => {
        let status = 'Not Started';
        if (cycle) {
          try {
            const res = await api.get(`/self-assessments/employee/${report.id}/cycle/${cycle.id}`);
            if (res.data?.length > 0) {
              const allSubmitted = res.data.every(a => a.status === 'SUBMITTED');
              status = allSubmitted ? 'Self-Assessment Submitted' : 'Self-Assessment in Draft';
            }
          } catch (e) {}
        }
        return { ...report, assessmentStatus: status };
      }));
      
      setReports(reportsWithStatus);
    } catch (err) {
      toast.error('Failed to load manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium">Loading your team...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Review performance and provide feedback for your direct reports.</p>
        </div>
        {activeCycle && (
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl flex items-center gap-3">
            <Clock className="text-indigo-600" size={18} />
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase leading-none">Active Cycle</p>
              <p className="text-sm font-bold text-indigo-900">{activeCycle.cycleName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Direct Reports</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">{reports.length}</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Assessments Pending</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-slate-900">
              {reports.filter(r => r.assessmentStatus !== 'Self-Assessment Submitted').length}
            </span>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Ready for Review</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-3xl font-bold text-emerald-600">
              {reports.filter(r => r.assessmentStatus === 'Self-Assessment Submitted').length}
            </span>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Direct Reports</h2>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        {report.name.charAt(0)}
                      </div>
                      <div className="font-bold text-slate-900">{report.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{report.designation}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${report.assessmentStatus === 'Self-Assessment Submitted' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : report.assessmentStatus.includes('Draft')
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'}`}>
                      {report.assessmentStatus === 'Self-Assessment Submitted' && <CheckCircle2 size={10} />}
                      {report.assessmentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/manager-reviews?employeeId=${report.id}`}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                        ${report.assessmentStatus === 'Self-Assessment Submitted'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      Rate Employee
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 italic">
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
