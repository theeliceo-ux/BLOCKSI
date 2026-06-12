import React from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import {
  BarChart3,
  FileText,
  Bell,
  Activity,
  Award,
  CheckCircle,
  Hash,
  FolderMinus,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  const { notes, reminders, categories, tags, history } = useBlocksi();

  const activeNotes = notes.filter((n) => n.status === 'active');
  const activeReminders = reminders.filter((r) => r.status !== 'trash');
  const completedReminders = activeReminders.filter((r) => r.status === 'completed');

  // Words and Characters aggregate
  const totalWords = activeNotes.reduce((sum, n) => sum + (n.wordCount || 0), 0);
  const totalChars = activeNotes.reduce((sum, n) => sum + (n.charCount || 0), 0);

  // Active dates calculated from note creation log + history logs
  const getActiveDaysCount = () => {
    const datesSet = new Set<string>();
    
    activeNotes.forEach((n) => {
      if (n.createdAt) datesSet.add(n.createdAt);
    });
    
    history.forEach((h) => {
      try {
        const dStr = h.timestamp.split('T')[0];
        datesSet.add(dStr);
      } catch {}
    });

    return datesSet.size > 0 ? datesSet.size : 2; // seed fallback
  };

  const activeDaysCount = getActiveDaysCount();

  // Parse productive month (June is default due to seed, let's make it fully dynamic!)
  const getProductiveMonthStr = () => {
    const monthCounts: Record<string, number> = {};
    const SpanishMonthsMap = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    activeNotes.forEach((n) => {
      try {
        const parts = n.createdAt.split('-');
        const monthIndex = parseInt(parts[1]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          const mName = SpanishMonthsMap[monthIndex];
          monthCounts[mName] = (monthCounts[mName] || 0) + 1;
        }
      } catch {}
    });

    let bestMonth = 'Junio';
    let max = 0;
    Object.entries(monthCounts).forEach(([m, count]) => {
      if (count > max) {
        max = count;
        bestMonth = m;
      }
    });

    return bestMonth;
  };

  const productiveMonth = getProductiveMonthStr();

  // Category usage analytics listing
  const getCategoryStats = () => {
    const counts: Record<string, number> = {};
    activeNotes.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });

    return categories.map((cat) => {
      const count = counts[cat.name] || 0;
      const ratio = activeNotes.length > 0 ? (count / activeNotes.length) * 100 : 0;
      return {
        ...cat,
        count,
        ratio: Math.round(ratio),
      };
    }).sort((a, b) => b.count - a.count);
  };

  const categoryStats = getCategoryStats();
  const topCategoryName = categoryStats[0]?.count > 0 ? categoryStats[0].name : 'Personal';

  // Tags usage analytics listing
  const getTopTagStr = () => {
    const counts: Record<string, number> = {};
    activeNotes.forEach((n) => {
      if (n.tags) {
        n.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    let topTag = '#Ideas';
    let max = 0;
    Object.entries(counts).forEach(([t, count]) => {
      if (count > max) {
        max = count;
        topTag = `#${t}`;
      }
    });

    return { name: topTag, count: max };
  };

  const topTagStats = getTopTagStr();

  // Reminder completion rates
  const getCompletionRates = () => {
    const total = activeReminders.length;
    if (total === 0) return 0;
    const completed = completedReminders.length;
    return Math.round((completed / total) * 100);
  };

  const reminderCompletionRate = getCompletionRates();

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="font-serif font-black text-2xl text-black uppercase tracking-tight">Tablero de Estadísticas</h1>
        <p className="text-xs text-black/60">
          Analiza tu volumen de escritura, tasa de cumplimiento de avisos y categorías predilectas.
        </p>
      </div>

      {/* Hero Stats Bento widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core numbers widgets */}
        <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div className="flex items-center gap-2">
            <Award className="text-[#FF4D00]" size={18} />
            <span className="font-serif font-black uppercase text-black text-sm">Resumen de Métricas</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-1">
            <div className="p-3 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-mono leading-none text-black/60 block uppercase font-black">Palabras escritas</span>
              <span className="text-lg font-black text-black font-mono pt-1 block">{totalWords}</span>
            </div>
            <div className="p-3 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-mono leading-none text-black/60 block uppercase font-black">Caracteres</span>
              <span className="text-lg font-black text-black font-mono pt-1 block">{totalChars}</span>
            </div>
            <div className="p-3 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-mono leading-none text-black/60 block uppercase font-black">Días activos</span>
              <span className="text-lg font-black text-black font-mono pt-1 block">{activeDaysCount} d</span>
            </div>
            <div className="p-3 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-mono leading-none text-black/60 block uppercase font-black">Mes Productivo</span>
              <span className="text-xs font-mono font-black text-[#FF4D00] block pt-1.5 truncate uppercase">{productiveMonth}</span>
            </div>
          </div>
        </div>

        {/* Task Completion Radial indicator widget */}
        <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 flex flex-col items-center justify-between text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div className="flex items-center gap-2 self-start">
            <Target className="text-black" size={18} />
            <span className="font-serif font-black uppercase text-black text-sm">Tasa de Cumplimiento</span>
          </div>

          {/* Radial visual ring */}
          <div className="relative w-28 h-28 flex items-center justify-center my-1 select-none">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#EFEFEF"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#FF4D00"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * reminderCompletionRate) / 100}
                strokeLinecap="square"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-black font-mono leading-none">{reminderCompletionRate}%</span>
              <span className="text-[9px] font-mono text-black/50 uppercase font-black mt-0.5">Realizado</span>
            </div>
          </div>

          <p className="text-3xs font-mono text-black/60 leading-normal max-w-[200px] uppercase font-bold">
            Has completado <strong>{completedReminders.length}</strong> de tus <strong>{activeReminders.length}</strong> recordatorios programados en total.
          </p>
        </div>

        {/* Taxonomy Leaders widget */}
        <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#FF4D00]" size={18} />
            <span className="font-serif font-black uppercase text-black text-sm">Líderes de Organización</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <FolderMinus className="text-black shrink-0" size={15} />
                <div>
                  <span className="text-[9px] font-mono text-black/60 block uppercase font-black leading-none pb-1">Categoría más usada</span>
                  <p className="text-xs font-serif font-black text-black truncate uppercase tracking-tight">{topCategoryName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#F9F9F7] border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 overflow-hidden pr-2">
                <Hash className="text-black shrink-0" size={15} />
                <div>
                  <span className="text-[9px] font-mono text-black/60 block uppercase font-black leading-none pb-1">Hashtag Principal</span>
                  <p className="text-xs font-serif font-black text-black truncate uppercase tracking-tight">
                    {topTagStats.count > 0 ? `${topTagStats.name} (${topTagStats.count} v)` : '#Ideas (Seed)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Category Weights list */}
      <div className="bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="font-serif font-black text-base text-black uppercase tracking-tight">Distribución de Contenido por Categorías</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryStats.map((item) => {
            return (
              <div key={item.id} className="p-3 bg-white border-2 border-black rounded-none space-y-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-black text-black flex items-center gap-2 uppercase tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-none border border-black" style={{ backgroundColor: item.color === 'rose' ? '#f43f5e' : item.color === 'indigo' ? '#6366f1' : item.color === 'amber' ? '#f59e0b' : item.color === 'emerald' ? '#10b981' : '#8b5cf6' }} />
                    {item.name}
                  </span>
                  <span className="text-[9px] font-mono text-black/60 uppercase font-black">
                    {item.count} {item.count === 1 ? 'nota' : 'notas'} ({item.ratio}%)
                  </span>
                </div>

                {/* Micro Progress Bar container */}
                <div className="h-2.5 w-full bg-[#EFEFEF] border border-black rounded-none overflow-hidden">
                  <div
                    className="h-full bg-[#FF4D00] border-r border-black transition-all duration-700"
                    style={{ width: `${item.ratio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
