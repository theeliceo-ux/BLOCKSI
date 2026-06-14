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
    triggerMockNotification,
    pushToGitHub,
    pullFromGitHub,
    isGitHubSyncing,
    lastGitSyncTime,
  } = useBlocksi();

  // Settings states
  const [theme, setTheme] = useState(settings.theme);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);

  // GitHub Sync states
  const [ghEnabled, setGhEnabled] = useState(settings.githubEnabled || false);
  const [ghUsername, setGhUsername] = useState(settings.githubUsername || '');
  const [ghRepo, setGhRepo] = useState(settings.githubRepo || '');
  const [ghBranch, setGhBranch] = useState(settings.githubBranch || 'main');
  const [ghToken, setGhToken] = useState(settings.githubToken || '');
  const [ghPath, setGhPath] = useState(settings.githubPath || `blocksi-data-${settings.githubUsername || 'user'}.json`);
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isAlertOnly?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isAlertOnly: false,
    onConfirm: () => {}
  });

  // Taxonomy states
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [newTagName, setNewTagName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplySettings = () => {
    saveSettings({
      theme,
      language: 'es',
      fontSize,
      notificationsEnabled: notifications,
      autoBackup: settings.autoBackup,
      githubEnabled: ghEnabled,
      githubUsername: ghUsername.trim(),
      githubRepo: ghRepo.trim(),
      githubBranch: ghBranch.trim(),
      githubToken: ghToken.trim(),
      githubPath: ghPath.trim(),
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
      setConfirmModal({
        isOpen: true,
        title: 'Error de Exportación',
        message: 'Ocurrió un error al intentar exportar la base de datos de BLOCKSI.',
        isAlertOnly: true,
        onConfirm: () => {}
      });
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
          setConfirmModal({
            isOpen: true,
            title: '¡Importación Exitosa!',
            message: 'La base de datos de BLOCKSI se ha cargado correctamente. La aplicación se reiniciará para reflejar los cambios.',
            isAlertOnly: true,
            onConfirm: () => {
              window.location.reload();
            }
          });
        } else {
          setConfirmModal({
            isOpen: true,
            title: 'Error de Importación',
            message: 'Fallo al importar el archivo. Asegúrese de que es un archivo .json válido exportado de BLOCKSI.',
            isAlertOnly: true,
            onConfirm: () => {}
          });
        }
      } catch {
        setConfirmModal({
          isOpen: true,
          title: 'Error de Archivo',
          message: 'Error al procesar el archivo seleccionado.',
          isAlertOnly: true,
          onConfirm: () => {}
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: '¿Confirmar Reseteo?',
      message: '¿ESTÁS ABSOLUTAMENTE SEGURO? Esto eliminará definitivamente todas tus notas, categorías, recordatorios y registros guardados localmente.',
      isAlertOnly: false,
      onConfirm: () => {
        clearAllData();
        triggerMockNotification('🚨 Base de Datos Reseteada', 'Se borraron todos los registros locales.');
        
        setTimeout(() => {
          setConfirmModal({
            isOpen: true,
            title: 'Datos Eliminados',
            message: 'Se han borrado todos los datos locales. Clic para reiniciar la aplicación.',
            isAlertOnly: true,
            onConfirm: () => {
              window.location.reload();
            }
          });
        }, 300);
      }
    });
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
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            
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

      {/* Sincronización en la Nube con GitHub */}
      <div className="bg-white border-2 border-black rounded-none p-5 md:p-6 space-y-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2.5">
            <FolderSync className="text-[#FF4D00]" size={20} />
            <h2 className="font-serif font-black text-base text-black uppercase tracking-tight">Sincronización en la Nube con GitHub</h2>
          </div>
          <button
            type="button"
            onClick={() => setGhEnabled(!ghEnabled)}
            className={`w-12 h-6 border-2 border-black rounded-none p-0.5 transition-all duration-200 cursor-pointer ${
              ghEnabled ? 'bg-[#FF4D00]' : 'bg-[#EFEFEF]'
            }`}
          >
            <div className={`w-4 h-4 border border-black bg-white transition-all duration-200 ${
              ghEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <p className="text-[11px] font-mono font-bold text-black/60 uppercase leading-relaxed">
          Permite guardar tus notas, recordatorios, y configuraciones directamente en tu propio repositorio de GitHub. 
          Al tener activado esto, la aplicación leerá del archivo JSON al iniciar y guardará tus cambios al sincronizar, logrando persistencia total en repositorios estáticos.
        </p>

        {ghEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Usuario de GitHub</label>
              <input
                type="text"
                placeholder="ej. theeliceo"
                value={ghUsername}
                onChange={(e) => setGhUsername(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Repositorio</label>
              <input
                type="text"
                placeholder="ej. blocksi"
                value={ghRepo}
                onChange={(e) => setGhRepo(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Rama (Branch)</label>
              <input
                type="text"
                placeholder="ej. main"
                value={ghBranch}
                onChange={(e) => setGhBranch(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Nombre del Archivo .json</label>
              <input
                type="text"
                placeholder="ej. blocksi-data.json"
                value={ghPath}
                onChange={(e) => setGhPath(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-sans font-bold uppercase"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">
                Personal Access Token de GitHub (PAT) <span className="text-[#FF4D00] font-black">*</span>
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/35 font-mono"
              />
              <span className="text-[9px] font-mono text-black/45 uppercase block tracking-tight leading-tight">
                Se almacena localmente y sirve para enviar comandos de guardado. Requiere permisos de escritura de contenidos ("contents: write").
              </span>
            </div>

            {/* Sync Actions */}
            <div className="md:col-span-2 flex flex-wrap gap-2.5 pt-3 border-t-2 border-black/10">
              <button
                type="button"
                disabled={isGitHubSyncing || !ghToken || !ghUsername || !ghRepo}
                onClick={async () => {
                  setSyncMsg({ type: '', text: '' });
                  const res = await pushToGitHub();
                  if (res.success) {
                    setSyncMsg({ type: 'success', text: '¡Guardado correctamente en tu repositorio git!' });
                  } else {
                    setSyncMsg({ type: 'error', text: `Error de push: ${res.error}` });
                  }
                }}
                className={`py-2 px-4 rounded-none text-[10px] font-mono font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                  isGitHubSyncing ? 'opacity-50 cursor-not-allowed' : 'bg-black text-white hover:bg-black/90'
                }`}
              >
                {isGitHubSyncing ? 'Guardando...' : '💾 Guardar en GitHub (Push)'}
              </button>

              <button
                type="button"
                disabled={isGitHubSyncing || !ghToken || !ghUsername || !ghRepo}
                onClick={() => {
                  setSyncMsg({ type: '', text: '' });
                  setConfirmModal({
                    isOpen: true,
                    title: '¿Sincronizar desde GitHub?',
                    message: '¿Deseas descargar el contenido desde GitHub y sobreescribir los datos locales? Se perderán las modificaciones locales no sincronizadas.',
                    isAlertOnly: false,
                    onConfirm: async () => {
                      const res = await pullFromGitHub();
                      if (res.success) {
                        setSyncMsg({ type: 'success', text: '¡Cargado correctamente! Recargando...' });
                        setTimeout(() => window.location.reload(), 1000);
                      } else {
                        setSyncMsg({ type: 'error', text: `Error de pull: ${res.error}` });
                      }
                    }
                  });
                }}
                className={`py-2 px-4 rounded-none text-[10px] font-mono font-black uppercase tracking-wider transition-all border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                  isGitHubSyncing ? 'opacity-50 cursor-not-allowed' : 'bg-[#F9F9F7] text-black hover:bg-black/5'
                }`}
              >
                {isGitHubSyncing ? 'Descargando...' : '📥 Descargar de GitHub (Pull)'}
              </button>
            </div>

            {syncMsg.text && (
              <div className={`md:col-span-2 p-3 font-mono text-[10px] font-black uppercase rounded-none border-2 border-black leading-tight ${
                syncMsg.type === 'success' ? 'bg-[#10b981]/10 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {syncMsg.text}
              </div>
            )}

            {lastGitSyncTime && (
              <div className="md:col-span-2 text-[9px] font-mono font-black text-black/55 uppercase tracking-wide">
                Última Sincronización: {lastGitSyncTime}
              </div>
            )}
          </div>
        )}
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

      {/* Reusable Neo-brutalist Confirm / Alert Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 text-[#FF4D00]">
              <Settings size={22} className="shrink-0" />
              <h3 className="font-serif font-black text-base text-black uppercase tracking-tight">{confirmModal.title}</h3>
            </div>
            <p className="text-xs font-mono font-bold text-black/70 uppercase leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              {!confirmModal.isAlertOnly && (
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border-2 border-black bg-white hover:bg-black/5 text-black font-mono font-black text-xs uppercase cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 border-2 border-black bg-black hover:bg-black/90 text-white font-mono font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                {confirmModal.isAlertOnly ? 'Entendido' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
