import React, { useState } from 'react';
import HRManagement from './HRManagement';
import UserManagement from './UserManagement';
import CreateUser from './CreateUser';
import { LayoutDashboard, Users, UserPlus, Settings2, BarChart3 } from 'lucide-react';

const HRAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'users', name: 'Directory', icon: Users },
    { id: 'create', name: 'Provision User', icon: UserPlus },
    { id: 'cycles', name: 'Cycles & KPIs', icon: Settings2 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Control Center</h1>
        <p className="text-slate-500 mt-1">Manage the organization, appraisal cycles, and performance metrics.</p>
      </div>

      {/* Modern Tab Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
            >
              <Icon size={18} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-1">Organization</h3>
              <p className="text-indigo-100 text-sm mb-6">Manage roles and permissions for all employees.</p>
              <button onClick={() => setActiveTab('users')} className="bg-white text-indigo-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
                View Directory
              </button>
            </div>
            
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Settings2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Active Cycles</h3>
              <p className="text-slate-500 text-sm mb-6">Configure performance periods and KPIs.</p>
              <button onClick={() => setActiveTab('cycles')} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                Manage Cycles
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-1">Analytics</h3>
              <p className="text-slate-500 text-sm mb-6">View performance trends across departments.</p>
              <button className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                View Reports
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'create' && <CreateUser />}
        {activeTab === 'cycles' && <HRManagement />}
      </div>
    </div>
  );
};

export default HRAdminDashboard;
