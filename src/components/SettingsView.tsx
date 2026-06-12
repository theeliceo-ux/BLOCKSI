import React, { useState, useRef } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Type,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  AlertOctagon,
  Languages,
  FolderSync
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    saveSettings,
    categories,
    addCategory,
    removeCategory,
    tags,
    addNewTag,
    removeExistingTag,
    clearAllData,
    exportJsonData,
    importJsonData,
    triggerMockNotification
  } = useBlocksi();

  // Settings states
  const [theme, setTheme] = useState(settings.theme);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);
  const [language, setLanguage] = useState(settings.language);

  // Taxonomy states
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [newTagName, setNewTagName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplySettings = () => {
    saveSettings({
      theme,
      language,
      fontSize,
      notificationsEnabled: notifications,
      autoBackup: settings.autoBackup,
    });

    // In a real browser, toggle root HTML class if theme is modified
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    triggerMockNotification(
      '⚙️ Configuración Aplicada',
      'Preferencias de apariencia y alertas guardadas exitosamente.'
    );
  };

  const handleExport = () => {
    try {
      const dataStr = exportJsonData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blocksi_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerMockNotification('💾 Copia de Seguridad Descargada', 'Exportación JSON exitosa.');
    } catch {
      alert('Error en exportación.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importJsonData(text);
        if (ok) {
          triggerMockNotification('📂 Sincronización Exitosa', 'Base de datos importada correctamente.');
          alert('¡Base de datos importada exitosamente! El contenido se ha actualizado.');
          window.location.reload();
        } else {
          alert('Fallo al importar. Asegúrese de que es un archivo .json exportado de BLOCKSI.');
        }
      } catch {
        alert('Error al leer el archivo seleccionado.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('¿ESTÁS ABSOLUTAMENTE SEGURO? Esto eliminará definitivamente todas tus notas, categorías, recordatorios y registros guardados localmente.')) {
      clearAllData();
      triggerMockNotification('🚨 Base de Datos Reseteada', 'Se borraron todos los registros locales.');
      alert('Se han borrado todos los datos. La aplicación regresará a su estado inicial.');
      window.location.reload();
    }
  };

  const handleAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    addNewTag(newTagName.trim());
    setNewTagName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: config parameters (8 cols) */}
        <div className="lg:col-span-8 bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          
          <div className="flex items-center gap-2.5 border-b-2 border-black pb-3">
            <Settings className="text-black" size={20} />
            <h2 className="font-serif font-black text-lg text-black uppercase tracking-tight">General y Apariencia</h2>
          </div>

          <div className="space-y-5">
            
            {/* Theme picker */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Modo de Visualización</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3 rounded-none flex flex-col items-center gap-1.5 border-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#FF4D00] border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-[#F9F9F7] border-black/20 text-black/60 hover:bg-[#F9F9F7]/60'
                  }`}
                >
                  <Sun size={18} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">Modo Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3 rounded-none flex flex-col items-center gap-1.5 border-2 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#FF4D00] border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-[#F9F9F7] border-black/20 text-black/60 hover:bg-[#F9F9F7]/60'
                  }`}
                >
                  <Moon size={18} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">Modo Oscuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('auto')}
                  className={`p-3 rounded-none flex flex-col items-center gap-1.5 border-2 transition-all cursor-pointer ${
                    theme === 'auto'
                      ? 'bg-[#FF4D00] border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-[#F9F9F7] border-black/20 text-black/60 hover:bg-[#F9F9F7]/60'
                  }`}
                >
                  <Monitor size={18} />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider">Automático</span>
                </button>
              </div>
            </div>

            {/* Font size selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Tamaño del Texto del Editor</label>
              <div className="flex bg-[#F9F9F7] border-2 border-black rounded-none overflow-hidden p-0.5 max-w-sm">
                {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`flex-1 py-1.5 text-[10px] font-mono font-black uppercase rounded-none transition-all cursor-pointer ${
                      fontSize === sz ? 'bg-black text-white' : 'text-black/55 hover:bg-black/5'
                    }`}
                  >
                    {sz === 'sm' ? 'Pequeño' : sz === 'md' ? 'Mediano' : sz === 'lg' ? 'Grande' : 'Extra'}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Idioma de Interfaz</label>
              <div className="flex bg-[#F9F9F7] border-2 border-black rounded-none overflow-hidden p-0.5 max-w-xs text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('es')}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-black uppercase rounded-none flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    language === 'es' ? 'bg-black text-white' : 'text-black/55 hover:bg-black/5'
                  }`}
                >
                  <Languages size={11} />
                  Español (ES)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-black uppercase rounded-none flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    language === 'en' ? 'bg-black text-white' : 'text-black/55 hover:bg-black/5'
                  }`}
                >
                  <Languages size={11} />
                  English (EN)
                </button>
              </div>
            </div>

            {/* Notifications toggles */}
            <div className="flex items-center justify-between p-4 bg-[#F9F9F7] rounded-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-0.5 pr-2">
                <span className="text-xs font-serif font-black uppercase text-black flex items-center gap-1.5 tracking-tight">
                  <Bell size={13} className="text-black" /> Alertas de Notificaciones locales
                </span>
                <span className="text-[10px] font-mono font-bold uppercase text-black/50 block leading-tight">Mostrar avisos en la barra superior al disparar recordatorios</span>
              </div>

              <button
                type="button"
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 border-2 border-black rounded-none p-0.5 transition-colors duration-200 cursor-pointer ${
                  notifications ? 'bg-[#FF4D00]' : 'bg-[#EFEFEF]'
                }`}
              >
                <div className={`w-4 h-4 border border-black bg-white transition-all duration-200 ${
                  notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Actions button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleApplySettings}
                className="py-2.5 px-5 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>

        {/* Right side drawers: backups and taxonomy (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Backups card */}
          <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-serif font-black uppercase text-sm text-black flex items-center gap-1.5 tracking-tight border-b-2 border-black pb-2.5">
              <FolderSync size={16} className="text-[#FF4D00]" /> Copia de Seguridad
            </h3>

            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full py-2 px-3 bg-white border-2 border-black hover:bg-[#F9F9F7] text-black rounded-none text-xs font-mono font-black uppercase flex items-center gap-2 justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
              >
                <Download size={14} /> Exportar JSON
              </button>
              
              <button
                onClick={handleImportClick}
                className="w-full py-2 px-3 bg-white border-2 border-black hover:bg-[#F9F9F7] text-black rounded-none text-xs font-mono font-black uppercase flex items-center gap-2 justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none cursor-pointer"
              >
                <Upload size={14} /> Importar Datos (.json)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>

            <div className="border-t-2 border-black pt-3">
              <button
                onClick={handleResetData}
                className="w-full py-2.5 px-3 bg-white border-2 border-black hover:bg-red-600 hover:text-white rounded-none text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                <RotateCcw size={13} /> Restablecer BLOCKSI
              </button>
            </div>
          </div>

          {/* Categories editor inside settings */}
          <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-serif font-black uppercase text-sm text-black border-b-2 border-black pb-2.5 tracking-tight">Personalizar Categorías</h3>
            
            <form onSubmit={handleAddCat} className="flex gap-1.5 items-stretch">
              <input
                type="text"
                placeholder="Nombre..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1 text-xs text-black flex-grow focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
              <select
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="bg-[#F9F9F7] border-2 border-black rounded-none px-1.5 text-xs text-black font-mono font-black uppercase focus:outline-none cursor-pointer"
              >
                <option value="indigo">Azul</option>
                <option value="amber">Ámbar</option>
                <option value="emerald">Verde</option>
                <option value="rose">Rosa</option>
                <option value="teal">Teal</option>
                <option value="purple">Morado</option>
              </select>
              <button type="submit" className="p-1.5 px-3 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none font-black text-xs transition-colors cursor-pointer">
                +
              </button>
            </form>

            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-2xs p-2 bg-[#F9F9F7] rounded-none border-2 border-black leading-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-serif font-black text-black flex items-center gap-1.5 capitalize uppercase">
                    <span className="w-2 h-2 rounded-none border border-black" style={{ backgroundColor: c.color === 'rose' ? '#f43f5e' : c.color === 'indigo' ? '#6366f1' : c.color === 'amber' ? '#f59e0b' : c.color === 'emerald' ? '#10b981' : '#8b5cf6' }} />
                    {c.name}
                  </span>
                  {categories.length > 1 && (
                    <button
                      onClick={() => removeCategory(c.id)}
                      className="text-black hover:text-[#FF4D00] p-0.5 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags editor inside settings */}
          <div className="bg-white border-2 border-black rounded-none p-5 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-serif font-black uppercase text-sm text-black border-b-2 border-black pb-2.5 tracking-tight">Configurar Etiquetas</h3>
            
            <form onSubmit={handleAddTag} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Nueva etiqueta..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1 text-xs text-black flex-grow focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
              <button type="submit" className="p-1.5 px-3 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none font-black text-xs transition-colors cursor-pointer">
                +
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pt-1">
              {tags.map((t) => (
                <span key={t.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-none bg-white border border-black text-black font-mono text-[10px] font-bold uppercase">
                  #{t.name}
                  <button onClick={() => removeExistingTag(t.id)} className="text-black/50 hover:text-[#FF4D00] font-bold cursor-pointer">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
