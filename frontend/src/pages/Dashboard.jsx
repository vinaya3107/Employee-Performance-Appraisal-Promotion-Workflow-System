import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Users, Target, ShieldCheck, Award, Clock, CheckCircle2, AlertCircle, BarChart3, TrendingUp, FileText } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass, sub }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const statusColor = {
  DRAFT: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  SELF_ASSESSMENT: 'bg-indigo-100 text-indigo-700',
  MANAGER_REVIEW: 'bg-amber-100 text-amber-700',
  COMMITTEE_REVIEW: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const cycleStages = ['DRAFT','ACTIVE','SELF_ASSESSMENT','MANAGER_REVIEW','COMMITTEE_REVIEW','COMPLETED'];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeCycle, setActiveCycle] = useState(null);
  const [stats, setStats] = useState({ users: 0, kpis: 0, eligible: 0, summaries: 0 });
  const [myAssessments, setMyAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cycleRes = await api.get('/cycles/active');
        const cycle = cycleRes.data?.[0] || null;
        setActiveCycle(cycle);

        // Load stats based on role
        const statsData = { users: 0, kpis: 0, eligible: 0, summaries: 0 };

        const kpiRes = await api.get('/kpis');
        statsData.kpis = kpiRes.data?.length || 0;

        if (['ADMIN', 'HR_MANAGER'].includes(user?.role)) {
          const usersRes = await api.get('/users');
          statsData.users = usersRes.data?.length || 0;
          const eligRes = await api.get('/promotions/eligible');
          statsData.eligible = eligRes.data?.length || 0;
        }

        if (cycle && ['ADMIN', 'HR_MANAGER', 'REVIEW_COMMITTEE'].includes(user?.role)) {
          const sumRes = await api.get(`/appraisal-summary/cycle/${cycle.id}`);
          statsData.summaries = sumRes.data?.length || 0;
        }

        if (cycle && ['EMPLOYEE', 'MANAGER'].includes(user?.role)) {
          const saRes = await api.get(`/self-assessments/employee/${user.id}/cycle/${cycle.id}`);
          setMyAssessments(saRes.data || []);
        }

        setStats(statsData);
      } catch (err) {
        console.error('Dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stageIndex = activeCycle ? cycleStages.indexOf(activeCycle.status) : -1;
  const submittedCount = myAssessments.filter(a => a.status === 'SUBMITTED').length;
  const isFullySubmitted = myAssessments.length > 0 && submittedCount === myAssessments.length;

  const adminStats = [
    { title: 'Total Employees', value: stats.users, icon: Users, colorClass: 'bg-blue-500' },
    { title: 'Active KPIs', value: stats.kpis, icon: Target, colorClass: 'bg-indigo-500' },
    { title: 'Promotion Eligible', value: stats.eligible, icon: Award, colorClass: 'bg-emerald-500' },
    { title: 'Appraisals Done', value: stats.summaries, icon: BarChart3, colorClass: 'bg-amber-500' },
  ];

  const employeeStats = [
    { title: 'My KPI Assessments', value: `${submittedCount}/${myAssessments.length}`, icon: Target, colorClass: 'bg-indigo-500', sub: 'Submitted' },
    { title: 'Active Cycle', value: activeCycle ? activeCycle.cycleName : 'None', icon: Clock, colorClass: 'bg-blue-500', sub: activeCycle?.status || '' },
    { title: 'Status', value: isFullySubmitted ? 'Submitted' : myAssessments.length > 0 ? 'In Progress' : 'Pending', icon: CheckCircle2, colorClass: isFullySubmitted ? 'bg-emerald-500' : 'bg-amber-500' },
    { title: 'Available KPIs', value: stats.kpis, icon: FileText, colorClass: 'bg-purple-500' },
  ];

  const displayStats = ['ADMIN', 'HR_MANAGER', 'REVIEW_COMMITTEE'].includes(user?.role) ? adminStats : employeeStats;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-1">
            {activeCycle
              ? `Active cycle: ${activeCycle.cycleName}`
              : 'No active appraisal cycle currently.'}
          </p>
        </div>
        {activeCycle && (
          <span className={`px-4 py-2 rounded-2xl text-sm font-semibold border ${statusColor[activeCycle.status] || 'bg-slate-100 text-slate-600'}`}>
            {activeCycle.status.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cycle Timeline */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="text-indigo-600" size={22} />
            Appraisal Cycle Timeline
          </h3>

          {!activeCycle ? (
            <div className="text-center py-10 text-slate-400">
              <AlertCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p>No active cycle. HR will start the next cycle soon.</p>
            </div>
          ) : (
            <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {[
                { stage: 'ACTIVE', label: 'Cycle Activated', date: activeCycle.startDate },
                { stage: 'SELF_ASSESSMENT', label: 'Self Assessment', date: activeCycle.selfAssessmentDeadline, suffix: 'deadline' },
                { stage: 'MANAGER_REVIEW', label: 'Manager Review', date: activeCycle.managerAssessmentDeadline, suffix: 'deadline' },
                { stage: 'COMMITTEE_REVIEW', label: 'Committee Review', date: activeCycle.committeeReviewDeadline, suffix: 'deadline' },
                { stage: 'COMPLETED', label: 'Cycle Completed', date: activeCycle.endDate },
              ].map(({ stage, label, date, suffix }, idx) => {
                const thisIdx = cycleStages.indexOf(stage);
                const done = stageIndex > thisIdx;
                const active = stageIndex === thisIdx;
                return (
                  <div key={stage} className={`relative pl-10 ${!done && !active ? 'opacity-40' : ''}`}>
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                      ${done ? 'bg-emerald-500' : active ? 'bg-indigo-500' : 'bg-slate-200'}`}>
                      {done
                        ? <CheckCircle2 size={12} className="text-white" />
                        : active
                          ? <Clock size={12} className="text-white" />
                          : <div className="w-2 h-2 rounded-full bg-slate-400" />}
                    </div>
                    <h4 className="font-bold text-slate-900">{label}</h4>
                    {date && <p className="text-sm text-slate-500">{suffix ? `${suffix.charAt(0).toUpperCase() + suffix.slice(1)}: ` : ''}{date}</p>}
                    {active && <p className="text-xs font-semibold text-indigo-600 mt-0.5">● In Progress</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role-based Action Panel */}
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-200 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Role</h3>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
              {user?.role?.replace(/_/g, ' ')}
            </span>
            <div className="space-y-3 mt-4">
              {user?.role === 'EMPLOYEE' && (
                <>
                  {!activeCycle && <p className="text-indigo-100 text-sm">Waiting for HR to open the next appraisal cycle.</p>}
                  {activeCycle && !isFullySubmitted && (
                    <div className="p-3 bg-white/15 rounded-xl text-sm">
                      <p className="font-semibold flex items-center gap-2"><AlertCircle size={16} className="text-amber-300" /> Action needed</p>
                      <p className="text-indigo-100 mt-1">Submit your self-assessment before the deadline.</p>
                    </div>
                  )}
                  {isFullySubmitted && (
                    <div className="p-3 bg-white/15 rounded-xl text-sm">
                      <p className="font-semibold flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-300" /> All done!</p>
                      <p className="text-indigo-100 mt-1">Your assessment is submitted. Await manager review.</p>
                    </div>
                  )}
                </>
              )}
              {user?.role === 'MANAGER' && (
                <div className="p-3 bg-white/15 rounded-xl text-sm">
                  <p className="font-semibold">Review your team's self-assessments and submit manager ratings.</p>
                </div>
              )}
              {user?.role === 'REVIEW_COMMITTEE' && (
                <div className="p-3 bg-white/15 rounded-xl text-sm">
                  <p className="font-semibold">Moderate manager ratings, assign final scores, and recommend promotions.</p>
                </div>
              )}
              {['HR_MANAGER', 'ADMIN'].includes(user?.role) && (
                <div className="space-y-2">
                  <div className="p-3 bg-white/15 rounded-xl text-sm">
                    <p className="font-semibold">Manage cycles, KPIs, users, and approve promotions.</p>
                  </div>
                  {stats.eligible > 0 && (
                    <div className="p-3 bg-amber-400/30 rounded-xl text-sm border border-amber-300/30">
                      <p className="font-semibold text-amber-200 flex items-center gap-2">
                        <Award size={14} /> {stats.eligible} promotion{stats.eligible > 1 ? 's' : ''} pending approval
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {activeCycle && (
            <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20">
              <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wide mb-1">Current Cycle</p>
              <p className="font-bold">{activeCycle.cycleName}</p>
              <p className="text-xs text-indigo-200 mt-0.5">{activeCycle.startDate} → {activeCycle.endDate}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
