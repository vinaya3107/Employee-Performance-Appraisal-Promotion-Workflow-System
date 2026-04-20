import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { 
  LayoutDashboard, 
  UserCircle, 
  ClipboardCheck, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  TrendingUp,
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR_MANAGER', 'REVIEW_COMMITTEE', 'MANAGER', 'EMPLOYEE'] },
    { name: 'My Assessment', path: '/self-assessment', icon: UserCircle, roles: ['EMPLOYEE', 'MANAGER'] },
    { name: 'Manager Reviews', path: '/manager-reviews', icon: ClipboardCheck, roles: ['MANAGER'] },
    { name: 'Committee Review', path: '/committee-reviews', icon: Users, roles: ['REVIEW_COMMITTEE', 'ADMIN'] },
    { name: 'HR Management', path: '/hr-management', icon: Settings, roles: ['HR_MANAGER', 'ADMIN'] },
    { name: 'Create User', path: '/create-user', icon: UserCircle, roles: ['ADMIN', 'HR_MANAGER'] },
    { name: 'Promotion Board', path: '/promotions', icon: TrendingUp, roles: ['ADMIN', 'HR_MANAGER', 'REVIEW_COMMITTEE'] },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'HR_MANAGER'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="w-64 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 shadow-sm transition-all">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">A</div>
          AppraisalPro
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-4 mb-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800 uppercase">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
