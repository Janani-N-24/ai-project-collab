import { useState } from 'react';
import { LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = ({ onMenuClick, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 glass shadow-sm">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-gray-600" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name || 'Guest'}</span>
          <ChevronDown size={16} className="text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
