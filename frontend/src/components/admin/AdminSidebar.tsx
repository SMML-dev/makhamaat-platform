import React from 'react';
import { Activity, PackageOpen, Users, MessageSquare, Settings, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadInbox: number;
  unreadBroadcasts: number;
  syncText: string;
  setShowLogoutConfirm: (show: boolean) => void;
  t: any;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadInbox,
  unreadBroadcasts,
  syncText,
  setShowLogoutConfirm,
  t
}) => {
  return (
    <aside className="w-[280px] bg-gradient-to-b from-brand-dark to-gray-900 text-white hidden md:flex flex-col border-r border-[#1a1a1a] shadow-xl relative z-10 overflow-y-auto">
      {/* Subtle background element in sidebar */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg backdrop-blur-sm">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-yellow to-yellow-600 rounded-xl flex items-center justify-center text-brand-dark font-black text-2xl shadow-inner border border-yellow-400/50">
            G
          </div>
          <div>
            <p className="text-sm font-black text-brand-yellow uppercase tracking-widest leading-tight">{t('admin.sidebar_manager')}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t('admin.sidebar_logistics')}</p>
          </div>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 ml-2">{t('admin.operational_console')}</p>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Activity size={18} />
            <span>{t('common.dashboard')}</span>
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'stock' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <PackageOpen size={18} />
            <span>{t('admin.stock_mgmt')}</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'clients' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users size={18} />
            <span>{t('admin.actors')}</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'messages' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare size={18} />
              <span>{t('admin.messages')}</span>
            </div>
            {(unreadInbox + unreadBroadcasts) > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'messages' ? 'bg-white text-blue-600' : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}>
                {unreadInbox + unreadBroadcasts}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={18} />
            <span>{t('common.settings')}</span>
          </button>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-gray-900">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 mb-4 border border-gray-700 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase">{t('common.last_sync')}</span>
            <span className="w-2 h-2 rounded-full bg-brand-green relative">
              <span className="absolute inset-0 bg-brand-green rounded-full animate-ping opacity-75"></span>
              <span className="absolute inset-0 bg-brand-green rounded-full shadow-[0_0_8px_rgba(0,132,61,1)]"></span>
            </span>
          </div>
          <p className="text-white text-sm font-bold opacity-90">{syncText}</p>
        </div>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="group flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all shadow-sm border border-red-500/20 hover:border-red-500"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('common.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
