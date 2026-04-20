import React from 'react';
import { useSelector } from 'react-redux';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRAdminDashboard from './HRAdminDashboard';
import CommitteeReviewPanel from './CommitteeReviewPanel';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">Authenticating...</p>
      </div>
    );
  }

  // Route to the appropriate dashboard component based on role
  switch (user.role) {
    case 'ADMIN':
    case 'HR_MANAGER':
      return <HRAdminDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'REVIEW_COMMITTEE':
      return <CommitteeReviewPanel />;
    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard />;
  }
};

export default Dashboard;
