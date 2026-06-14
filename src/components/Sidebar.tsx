import React from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  Bell,
  Search,
  Star,
  History,
  BarChart3,
  Settings,
  Trash2,
  Menu,
  X,
  Plus
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewNoteClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onNewNoteClick }) => {
  const { 
    activeSection, 
    setActiveSection, 
    notes, 
    reminders,
    settings,
    pushToGitHub,
    isGitHubSyncing,
    lastGitSyncTime,
    activeUser,
    logoutUser
  } = useBlocksi();

  const activeNotesCount = notes.filter((n) => n.status === 'active').length;
  const pendingRemindersCount = reminders.filter((r) => r.status === 'pending').length;
  const starredNotesCount = notes.filter((n) => n.status === 'active' && n.favorite).length;
  const trashedCount = notes.filter((n) => n.status === 'trash').length + reminders.filter((r) => r.status === 'trash').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'calendar', label: 'Calendario', icon: Calendar, badge: null },
    { id: 'agenda', label: 'Agenda', icon: BookOpen, badge: null },
    { id: 'notes', label: 'Mis Notas', icon: FileText, badge: activeNotesCount > 0 ? activeNotesCount : null },
    { id: 'reminders', label: 'Recordatorios', icon: Bell, badge: pendingRemindersCount > 0 ? pendingRemindersCount : null },
    { id: 'search', label: 'Buscar', icon: Search, badge: null },
    { id: 'favorites', label: 'Favoritos', icon: Star, badge: starredNotesCount > 0 ? starredNotesCount : null },
    { id: 'history', label: 'Historial', icon: History, badge: null },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Configuración', icon: Settings, badge: null },
    { id: 'recycle_bin', label: 'Papelera', icon: Trash2, badge: trashedCount > 0 ? trashedCount : null, color: 'text-rose-400' },
  ];

  const handleNav = (id: string) => {
    setActiveSection(id);
    setIsOpen(false); // Close mobile drawer on selection
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r-2 border-black flex flex-col z-50 transition-transform duration-300 transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b-2 border-black bg-white">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-[#FF4D00] text-white font-serif font-black text-xl tracking-wider select-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              B
            </div>
            <span className="font-serif font-black text-xl text-black tracking-widest">
              BLOCKSI
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-none border border-black text-black hover:bg-black hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Creator Button */}
        <div className="p-4 border-b-2 border-black bg-[#F9F9F7]">
          <button
            onClick={() => {
              onNewNoteClick();
              setIsOpen(false);
            }}
            className="w-full py-2.5 px-4 bg-[#1A1A1A] hover:bg-[#FF4D00] text-white rounded-none border-2 border-black font-serif font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#FF4D00] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-98 transition-all"
          >
            <Plus size={16} />
            Escribir Nota
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 bg-white">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-none text-xs font-serif font-black uppercase tracking-wider transition-all group border ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-black shadow-[3px_3px_0px_0px_#FF4D00]'
                    : 'text-black border-transparent hover:bg-black/5 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      isActive ? 'text-[#FF4D00]' : 'text-black group-hover:text-[#FF4D00]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-black border ${
                    isActive ? 'bg-[#FF4D00] text-white border-white' : 'bg-[#1A1A1A] text-white border-black'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* GitHub Quick Sync footer */}
        {settings.githubEnabled && settings.githubUsername && settings.githubRepo && settings.githubToken && (
          <div className="p-3 border-t-2 border-black bg-[#f0fdf4] text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-black text-[#15803d] uppercase tracking-wide">
                ☁️ GITHUB CONECTADO
              </span>
              <span className={`w-2 h-2 rounded-none border border-black ${isGitHubSyncing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
            </div>
            
            <button
              type="button"
              disabled={isGitHubSyncing}
              onClick={async (e) => {
                e.stopPropagation();
                await pushToGitHub();
              }}
              className="mt-2 w-full py-1.5 px-2 border border-black bg-white hover:bg-black hover:text-white transition-all text-[9.5px] font-mono font-black uppercase text-center flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
            >
              {isGitHubSyncing ? 'Sincronizando...' : '🔄 Sincronizar Repo'}
            </button>
            {lastGitSyncTime && (
              <p className="text-[8px] font-mono text-black/55 mt-1.5 uppercase text-center leading-none">
                Último: {lastGitSyncTime.split(' ')[0]}
              </p>
            )}
          </div>
        )}

        {/* Bottom User Display & Cerrar Sesión Panel */}
        <div className="p-3 border-t-2 border-black bg-[#F9F9F7] text-left">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-6 h-6 rounded-none bg-black text-white border border-black font-mono font-black text-xs uppercase flex items-center justify-center select-none">
              {activeUser ? activeUser.charAt(0).toUpperCase() : '?'}
            </div>
            <span className="text-[10px] font-mono font-black text-black uppercase truncate max-w-[120px] select-none">
              {activeUser || 'INVITADO'}
            </span>
            <button
              onClick={() => logoutUser()}
              className="ml-auto px-1.5 py-0.5 border border-black bg-white hover:bg-[#FF4D00] hover:text-white text-black font-mono font-black text-[8px] uppercase tracking-wider cursor-pointer"
              title="Cerrar Sesión"
            >
              SALIR
            </button>
          </div>
          <div className="text-center pt-1 border-t border-black/10">
            <p className="text-[8px] font-mono text-black/55 uppercase tracking-tight select-none">
              BLOCKSI v1.0.0 • Offline Ready
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
