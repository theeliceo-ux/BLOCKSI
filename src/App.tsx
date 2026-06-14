import React, { useState, useEffect } from 'react';
import { BlocksiProvider, useBlocksi } from './context/BlocksiContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { NotesManager } from './components/NotesManager';
import { CalendarView } from './components/CalendarView';
import { AgendaView } from './components/AgendaView';
import { RemindersManager } from './components/RemindersManager';
import { SearchEngine } from './components/SearchEngine';
import { HistoryTimeline } from './components/HistoryTimeline';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsView } from './components/SettingsView';
import { RecycleBinView } from './components/RecycleBinView';
import { AuthView } from './components/AuthView';
import { db } from './db';

import {
  Menu,
  Bell,
  X,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    setActiveNoteId,
    activeNotifications,
    dismissNotification,
    postponeReminder,
    editReminder,
    reminders,
    activeUser
  } = useBlocksi();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Sync theme configurations on startup
  useEffect(() => {
    if (!activeUser) return;
    const saved = db.getSettings();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved.theme === 'dark' || (saved.theme === 'auto' && prefersDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [activeUser, settingsChangedToggle()]);

  // Small helper to evaluate changes
  function settingsChangedToggle() {
    if (!activeUser) return 'auto';
    const saved = db.getSettings();
    return saved.theme;
  }

  // Handle sidebar Quick Creatives
  const handleQuickWriteNote = () => {
    setActiveNoteId('new');
    setActiveSection('notes');
  };

  // Render view dispatcher based on active selection
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'agenda':
        return <AgendaView />;
      case 'notes':
        return <NotesManager />;
      case 'reminders':
        return <RemindersManager />;
      case 'search':
        return <SearchEngine />;
      case 'favorites':
        return <NotesManager />; // NotesManager automatically supports filtering by tags & favorites
      case 'history':
        return <HistoryTimeline />;
      case 'stats':
        return <StatsDashboard />;
      case 'settings':
        return <SettingsView />;
      case 'recycle_bin':
        return <RecycleBinView />;
      default:
        return <Dashboard />;
    }
  };

  // Click direct alert notification items redirects redirects
  const handleAlertClick = (linkedNoteId?: string, reminderId?: string, alertId?: string) => {
    if (alertId) dismissNotification(alertId);
    setShowNotificationCenter(false);

    if (linkedNoteId) {
      setActiveNoteId(linkedNoteId);
      setActiveSection('notes');
    } else if (reminderId) {
      setActiveSection('reminders');
    }
  };

  const handleAlertCompleteRem = (reminderId: string, alertId: string) => {
    const rem = reminders.find((r) => r.id === reminderId);
    if (rem) {
      editReminder({ ...rem, status: 'completed' });
    }
    dismissNotification(alertId);
  };

  const handleAlertPostponeRem = (reminderId: string, alertId: string, mins: number) => {
    postponeReminder(reminderId, mins);
    dismissNotification(alertId);
  };

  if (!activeUser) {
    return <AuthView />;
  }

  return (
    <div className="flex h-screen bg-[#F9F9F7] text-[#1A1A1A] font-sans overflow-hidden">
      
      {/* Sidebar navigation system */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onNewNoteClick={handleQuickWriteNote}
      />

      {/* Main workspace container panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* App Topbar header */}
        <header className="h-16 border-b-2 border-black bg-white px-6 flex items-center justify-between shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-none border border-black text-black hover:bg-black hover:text-white transition-colors cursor-pointer bg-white"
            >
              <Menu size={22} />
            </button>
            
            <h2 className="font-serif font-black text-black text-base tracking-widest hidden sm:block">
              BLOCKSI <span className="text-xs font-mono font-black text-[#FF4D00] uppercase tracking-wider ml-1">WORKSPACE</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Local Notification Alarm Center widget */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                className="p-2 rounded-none border-2 border-black bg-white text-black hover:bg-[#FF4D00] hover:text-white transition-colors relative cursor-pointer"
              >
                <Bell size={20} />
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4D00] border-2 border-white rounded-full animate-pulse" />
                )}
              </button>

              {/* Collapsible alerts drawer popup */}
              {showNotificationCenter && (
                <div className="absolute right-0 mt-2 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-80 p-4 space-y-3 z-55 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center justify-between border-b-2 border-black pb-1.5 shrink-0">
                    <span className="font-serif font-black text-black text-xs uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={12} className="text-[#FF4D00]" /> Centro de Avisos
                    </span>
                    <button
                      onClick={() => setShowNotificationCenter(false)}
                      className="text-black hover:text-[#FF4D00]"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {activeNotifications.length > 0 ? (
                    <div className="space-y-3">
                      {activeNotifications.map((alert) => (
                        <div
                          key={alert.id}
                          className="bg-white border-2 border-black p-2.5 rounded-none space-y-2 text-xs transition-all relative group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <div
                            onClick={() => handleAlertClick(alert.linkedNoteId, alert.reminderId, alert.id)}
                            className="cursor-pointer space-y-1 pr-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-serif font-black text-black capitalize text-xs tracking-tight">{alert.title}</span>
                              <span className="text-[10px] text-black/60 shrink-0 font-mono">{alert.time}</span>
                            </div>
                            <p className="text-black/80 line-clamp-2 leading-relaxed text-[11px]">{alert.body}</p>
                            {alert.linkedNoteId && (
                              <span className="text-[10px] font-mono text-[#FF4D00] flex items-center gap-1 pt-0.5 font-black uppercase tracking-wider">
                                <FolderOpen size={10} /> Ver nota asociada
                              </span>
                            )}
                          </div>

                          {/* Quick notification actions */}
                          {alert.reminderId && (
                            <div className="flex items-center gap-1.5 pt-1.5 border-t border-black/10">
                              <button
                                onClick={() => handleAlertCompleteRem(alert.reminderId!, alert.id)}
                                className="px-2 py-0.5 bg-[#1A1A1A] hover:bg-[#FF4D00] text-white rounded-none font-mono font-black uppercase text-[9px] border border-black"
                              >
                                Completar
                              </button>
                              <button
                                onClick={() => handleAlertPostponeRem(alert.reminderId!, alert.id, 10)}
                                className="px-2 py-0.5 bg-white hover:bg-[#1A1A1A] hover:text-white text-black rounded-none font-mono font-black uppercase text-[9px] border border-black"
                              >
                                +10m
                              </button>
                              <button
                                onClick={() => dismissNotification(alert.id)}
                                className="ml-auto text-black/60 hover:text-[#FF4D00] text-[9px] uppercase font-bold"
                              >
                                Descartar
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-black/40 italic py-4 text-center">No hay notificaciones activas.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Simulated Online Status */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-white text-black text-2xs font-mono rounded-none border-2 border-black uppercase font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="w-2 h-2 bg-[#FF4D00] border border-black rounded-full" />
              Offline Ready
            </span>
          </div>
        </header>

        {/* Dispatcher content segment */}
        <main className="flex-grow overflow-y-auto p-4 md:p-6 transition-all duration-300">
          {renderCurrentSection()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BlocksiProvider>
      <AppContent />
    </BlocksiProvider>
  );
}
