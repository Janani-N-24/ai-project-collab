import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Users, Settings } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-brand-gradient text-white p-6 sticky top-0">
      <div className="mb-10">
        <h1 className="text-lg font-bold leading-tight">AI Project</h1>
        <p className="text-sm text-white/70">Collaboration Platform</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-white/20 shadow-glass' : 'hover:bg-white/10 text-white/85'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="text-xs text-white/50 pt-6 border-t border-white/10">
        &copy; {new Date().getFullYear()} Final Year Project
      </div>
    </aside>
  );
};

export default Sidebar;
