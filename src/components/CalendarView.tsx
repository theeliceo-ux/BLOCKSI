import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Note, Reminder } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalIcon,
  Bell,
  FileText,
  Star,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    notes,
    reminders,
    selectedDate,
    setSelectedDate,
    setActiveSection,
    setActiveNoteId,
    editReminder
  } = useBlocksi();

  // Active viewing context (defaults to June 2026 matching our seed values perfectly!)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed (5 = June)

  const MONTHS_SPANISH = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Navigate calendar months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper date generators
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDayOfWeek = (year: number, month: number): number => {
    // 0 = Sunday, 1 = Monday, etc. Let's align such that Monday is start (0) to Sunday (6)
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // map so Monday is 0
  };

  // Build grid dates array
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getStartDayOfWeek(currentYear, currentMonth);
  
  const calendarCells: Array<{ isPlaceholder: boolean; dateNum?: number; dateStr?: string }> = [];

  // 1. Fill placeholders at start of week
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ isPlaceholder: true });
  }

  // 2. Fill actual month days
  for (let d = 1; d <= totalDays; d++) {
    const monthFormatted = String(currentMonth + 1).padStart(2, '0');
    const dayFormatted = String(d).padStart(2, '0');
    const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;

    calendarCells.push({
      isPlaceholder: false,
      dateNum: d,
      dateStr,
    });
  }

  // Find daily elements matching clicked cell
  const getActiveElementsForDate = (dateStr: string) => {
    const dailyNotes = notes.filter((n) => n.status === 'active' && (n.createdAt === dateStr || n.modifiedAt === dateStr));
    const dailyReminders = reminders.filter((r) => r.status === 'pending' && r.date === dateStr);
    const dailyStarred = notes.filter((n) => n.status === 'active' && n.favorite && (n.createdAt === dateStr || n.modifiedAt === dateStr));

    return {
      notes: dailyNotes,
      reminders: dailyReminders,
      starred: dailyStarred,
    };
  };

  // Trigger click daily cell
  const handleCellSelect = (dayStr: string) => {
    setSelectedDate(dayStr);
  };

  // Quick edit note redirect
  const handleEditNoteRedirect = (noteId: string) => {
    setActiveNoteId(noteId);
    setActiveSection('notes');
  };

  // Quick toggle reminder completion
  const handleToggleReminder = (rem: Reminder) => {
    editReminder({ ...rem, status: rem.status === 'completed' ? 'pending' : 'completed' });
  };

  // Selected date details listing
  const selectedDateAgenda = getActiveElementsForDate(selectedDate);
  const hasAgendaItems = selectedDateAgenda.notes.length > 0 || selectedDateAgenda.reminders.length > 0;

  // Formatting strings for the header of the details box
  const formatSpanishReadableHeader = (isoDateStr: string): string => {
    try {
      const parts = isoDateStr.split('-');
      const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return isoDateStr;
    }
  };  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Calendar Grid card (8 columns on desktops) */}
      <div className="lg:col-span-8 bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Navigation month/year header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalIcon className="text-[#FF4D00]" size={20} />
            <h2 className="font-serif font-black text-lg md:text-xl text-black uppercase tracking-tight">
              {MONTHS_SPANISH[currentMonth]} {currentYear}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 px-2 border border-black hover:bg-black hover:text-white rounded-none text-black transition-colors bg-white font-mono font-black"
            >
              &lt;
            </button>
            <button
              onClick={() => {
                // Instantly reset view to seed target (June 2026)
                setCurrentMonth(5);
                setCurrentYear(2026);
                setSelectedDate('2026-06-11');
              }}
              className="px-2.5 py-1 bg-white hover:bg-[#FF4D00] hover:text-white border-2 border-black rounded-none text-[10px] font-mono font-bold text-black transition-all uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
            >
              Ir a Jun 2026
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 px-2 border border-black hover:bg-black hover:text-white rounded-none text-black transition-colors bg-white font-mono font-black"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Days of week titles */}
        <div className="grid grid-cols-7 text-center border-b-2 border-black pb-2">
          {DAYS_SHORT.map((day) => (
            <span key={day} className="text-xs font-mono font-black text-black uppercase tracking-wider">
              {day}
            </span>
          ))}
        </div>

        {/* Dynamic calendar grid blocks */}
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {calendarCells.map((cell, idx) => {
            if (cell.isPlaceholder) {
              return <div key={`placeholder-${idx}`} className="aspect-square bg-transparent" />;
            }

            const dayStr = cell.dateStr!;
            const isActiveDay = selectedDate === dayStr;
            const indicators = getActiveElementsForDate(dayStr);
            const hasNotes = indicators.notes.length > 0;
            const hasReminders = indicators.reminders.length > 0;
            const hasStarred = indicators.starred.length > 0;

            return (
              <div
                key={dayStr}
                onClick={() => handleCellSelect(dayStr)}
                className={`aspect-square rounded-none p-1.5 md:p-2 flex flex-col justify-between cursor-pointer border-2 select-none transition-all ${
                  isActiveDay
                    ? 'bg-[#1A1A1A] border-black text-white shadow-[3px_3px_0px_0px_#FF4D00]'
                    : 'bg-[#F9F9F7] border-black/10 hover:border-black hover:bg-white text-black'
                }`}
              >
                {/* Num digit */}
                <span className={`text-xs md:text-sm font-serif font-black ${isActiveDay ? 'text-white' : 'text-black'}`}>
                  {cell.dateNum}
                </span>

                {/* Glyphs badges indicators underneath */}
                <div className="flex gap-0.5 justify-center mt-1">
                  {hasNotes && (
                    <span className="w-1.5 h-1.5 bg-[#FF4D00] border border-black" title="Notas" />
                  )}
                  {hasReminders && (
                    <span className="w-1.5 h-1.5 bg-black border border-white animate-pulse" title="Recordatorios" />
                  )}
                  {hasStarred && (
                    <span className="w-1.5 h-1.5 bg-yellow-400 border border-black" title="Favorito" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda details panel (4 columns) */}
      <div className="lg:col-span-4 bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Date Title Banner */}
        <div className="border-b-2 border-black pb-3 space-y-1">
          <span className="text-[10px] font-mono text-black/60 uppercase font-bold tracking-wider block">Agenda del Día</span>
          <h3 className="font-serif font-black text-black text-sm md:text-base uppercase tracking-tight">
            {formatSpanishReadableHeader(selectedDate)}
          </h3>
        </div>

        {/* Content details listed list */}
        {hasAgendaItems ? (
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            
            {/* Notes Section */}
            {selectedDateAgenda.notes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#FF4D00] font-black block tracking-wider">📝 Notas de hoy ({selectedDateAgenda.notes.length})</span>
                {selectedDateAgenda.notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleEditNoteRedirect(note.id)}
                    className="p-3 bg-[#F9F9F7] rounded-none border border-black hover:bg-white cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-serif font-bold text-black uppercase truncate">{note.title}</p>
                      <span className="text-[9px] font-mono text-black/60 block uppercase mt-0.5">{note.category}</span>
                    </div>
                    <ArrowRight size={12} className="text-black shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* Reminders Section */}
            {selectedDateAgenda.reminders.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-black font-black block tracking-wider">🔔 Recordatorios ({selectedDateAgenda.reminders.length})</span>
                {selectedDateAgenda.reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3 bg-[#F9F9F7] rounded-none border border-black flex items-start gap-2.5 justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-start gap-2.5 overflow-hidden">
                      <button
                        onClick={() => handleToggleReminder(rem)}
                        className="text-black hover:text-[#FF4D00] mt-0.5 shrink-0"
                      >
                        <CheckCircle size={14} className="text-black hover:text-[#FF4D00]" />
                      </button>
                      <div className="overflow-hidden">
                        <span className="text-xs text-black block font-serif font-bold uppercase truncate">{rem.title}</span>
                        {rem.description && (
                          <p className="text-[10px] text-black/70 truncate">{rem.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-black/60 shrink-0 font-bold">{rem.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center bg-[#F9F9F7] rounded-none border-2 border-dashed border-black/40 space-y-3">
            <p className="text-xs text-black/55 italic font-sans">No hay notas ni recordatorios agendados.</p>
            <button
              onClick={() => {
                setActiveSection('notes');
                setActiveNoteId('new');
              }}
              className="mx-auto py-1 px-3 bg-black hover:bg-[#FF4D00] text-white rounded-none text-xs font-serif font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={11} /> Redactar Nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
