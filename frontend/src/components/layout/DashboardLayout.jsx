import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const DashboardLayout = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
