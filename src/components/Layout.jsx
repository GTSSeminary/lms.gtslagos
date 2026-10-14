import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/study-guide', label: 'Study Guide', icon: BookOpen },
  { to: '/courses', label: 'Courses', icon: GraduationCap },
  { to: '/exams', label: 'Exams', icon: FileText },
  { to: '/results', label: 'Results', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <div className="flex flex-col h-full">
       <div className="flex items-center gap-3 px-6 py-6">
         <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
           <img src="/logo.svg" alt="GTS Logo" className="h-8 w-auto" />
         </div>
         <div className="leading-tight">
           <div className="font-display text-[14.5px] font-bold tracking-[-0.03em] text-slate-900 leading-none">
             Grace Theological Seminary
           </div>
           <div className="text-[11px] font-semibold tracking-wide text-slate-500 mt-1">
             Student Portal
           </div>
         </div>
       </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-slate-100">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur border-b border-slate-100 px-4 md:px-8 h-16">
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:block font-display font-semibold text-slate-700">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium text-slate-800">{user?.full_name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
              {(user?.full_name || 'S').charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
