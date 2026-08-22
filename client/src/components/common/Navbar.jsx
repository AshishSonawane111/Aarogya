import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Shield, 
  Bell, 
  Globe, 
  LogOut, 
  User, 
  Stethoscope, 
  Menu, 
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, profile, logout, isPatient, isDoctor } = useAuth();
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPortalLabel = () => {
    if (isPatient) return 'Patient Portal';
    if (isDoctor) return 'Doctor / Hospital Portal';
    return 'Healthcare Platform';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand and Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to={isPatient ? '/patient/dashboard' : isDoctor ? '/doctor/dashboard' : '/'} className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                  HEALTH PASSPORT
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 block sm:inline">
                  {getPortalLabel()}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowNotifMenu(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 text-sm font-medium transition"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-teal-600" />
                <span className="uppercase text-xs hidden sm:inline">{currentLanguage}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Indian Languages
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 transition ${
                        currentLanguage === lang.code ? 'font-bold text-teal-700 bg-teal-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </span>
                      <span className="text-slate-400 text-[10px]">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowLangMenu(false);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                      <p className="text-[11px] text-slate-500">{unreadCount} unread alert(s)</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link_url) {
                              navigate(n.link_url);
                              setShowNotifMenu(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                            !n.is_read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {n.type === 'consent' ? (
                              <Shield className="w-4 h-4 text-indigo-600" />
                            ) : n.type === 'medicine' ? (
                              <Clock className="w-4 h-4 text-emerald-600" />
                            ) : n.type === 'delay' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-teal-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                              <span>{n.title}</span>
                              {!n.is_read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                              {n.message}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {formatDate(n.created_at)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                  setShowLangMenu(false);
                }}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition"
              >
                <img
                  src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </div>
                  <div className="text-[10px] text-slate-500 capitalize">
                    {user?.role || 'Guest'}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">
                      {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {user?.email}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={isPatient ? '/patient/settings' : '/doctor/settings'}
                      onClick={() => setShowUserMenu(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
