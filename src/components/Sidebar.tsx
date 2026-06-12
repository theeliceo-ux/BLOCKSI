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
  const { activeSection, setActiveSection, notes, reminders } = useBlocksi();

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

        {/* Bottom Metadata Credit */}
        <div className="p-4 border-t-2 border-black text-center bg-[#F9F9F7]">
          <p className="text-xs font-mono text-black font-black uppercase tracking-wider">
            BLOCKSI v1.0.0
          </p>
          <p className="text-[9px] font-mono text-black/60 mt-0.5 uppercase tracking-tight">
            Persistencia Local Offline
          </p>
        </div>
      </aside>
    </>
  );
};
