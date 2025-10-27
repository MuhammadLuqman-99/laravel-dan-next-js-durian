import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  TreeDeciduous,
  Leaf,
  TrendingUp,
  Stethoscope,
  Droplet,
  Activity,
  DollarSign,
  ShoppingCart,
  Settings as SettingsIcon,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  MoreHorizontal,
  ChevronUp,
} from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Tanaman', path: '/pokok', icon: TreeDeciduous },
    { name: 'Baja', path: '/baja', icon: Leaf },
    { name: 'Spray/Racun', path: '/spray', icon: Droplet },
    { name: 'Hasil', path: '/hasil', icon: TrendingUp },
    { name: 'Inspeksi', path: '/inspeksi', icon: Stethoscope },
    { name: 'Jualan', path: '/sales', icon: ShoppingCart },
    { name: 'Perbelanjaan', path: '/expenses', icon: DollarSign },
    { name: 'Laporan', path: '/reports', icon: FileText },
    { name: 'Activity Logs', path: '/activity-logs', icon: Activity },
    ...(isAdmin ? [{ name: 'Pengguna', path: '/users', icon: Users }] : []),
    { name: 'Tetapan', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
            <h1 className="text-xl font-bold text-white">Sistem Kebun</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-2" />
              Log Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Sistem Pengurusan Kebun
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Selamat datang, {user?.name}</span>
            </div>
          </div>
        </header>

        {/* View-Only Mode Banner for Pekerja */}
        {!isAdmin && (
          <div className="bg-yellow-50 border-b-2 border-yellow-200 px-6 py-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                Anda dalam mod <strong>View Only</strong> - Hanya admin boleh tambah/edit/delete rekod
              </span>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        {/* More Menu Popup */}
        {moreMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setMoreMenuOpen(false)}
            />
            {/* More Menu Panel */}
            <div className="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 max-h-[60vh] overflow-y-auto">
              <div className="py-2 px-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">Semua Menu</h3>
                  <button
                    onClick={() => setMoreMenuOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <ChevronUp size={20} />
                  </button>
                </div>
                <div className="py-2 space-y-1">
                  {menuItems.slice(4).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        <span className="font-medium text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom Nav Items */}
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {/* First 4 main menu items */}
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors min-h-[60px] ${
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <Icon size={22} className="mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.name.split(' ')[0]}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors min-h-[60px] ${
              moreMenuOpen
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <MoreHorizontal size={22} className="mb-1" />
            <span className="text-[10px] font-medium text-center leading-tight">Lagi</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
