import React, { useState } from 'react';
import { useBlocksi } from '../context/BlocksiContext';
import { Sparkles, Key, User, HelpCircle, FolderSync, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export const AuthView: React.FC = () => {
  const {
    loginUser,
    registerUser,
    recoverPassword,
    connectGitHubSyncAccount,
    isGitHubSyncing
  } = useBlocksi();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'github'>('login');
  
  // Shared fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  // GitHub integration fields
  const [ghUser, setGhUser] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghToken, setGhToken] = useState('');
  const [ghBranch, setGhBranch] = useState('main');

  // Recovery utility
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveredPass, setRecoveredPass] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState('');

  // Password visibility
  const [showPass, setShowPass] = useState(false);

  // Notifications / status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearCredentials = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setSecurityAnswer('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    const success = loginUser(username.trim(), password);
    if (!success) {
      setErrorMsg('Usuario o contraseña incorrectos.');
    } else {
      setSuccessMsg('¡Sesión iniciada! Redirigiendo...');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = username.trim();
    if (!cleanUser || !password || !securityAnswer.trim()) {
      setErrorMsg('Todos los campos son totalmente requeridos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    const success = registerUser(cleanUser, password, securityAnswer.trim());
    if (!success) {
      setErrorMsg('El usuario ya se encuentra registrado localmente.');
    } else {
      setSuccessMsg('¡Cuenta registrada exitosamente!');
    }
  };

  const handleGithubConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = username.trim();
    if (!cleanUser || !password || !ghUser.trim() || !ghRepo.trim() || !ghToken.trim()) {
      setErrorMsg('Completa las credenciales de BLOCKSI y los accesos de GitHub.');
      return;
    }

    const res = await connectGitHubSyncAccount(
      cleanUser,
      password,
      ghUser.trim(),
      ghRepo.trim(),
      ghBranch.trim(),
      ghToken.trim()
    );

    if (res.success) {
      setSuccessMsg('¡Descargado y conectado exitosamente!');
    } else {
      setErrorMsg(`Error de conexión nuble: ${res.error}`);
    }
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoveredPass(null);

    if (!recoveryUser.trim() || !recoveryAnswer.trim()) {
      setRecoveryError('Por favor completa las respuestas solicitadas.');
      return;
    }

    const pass = recoverPassword(recoveryUser.trim(), recoveryAnswer.trim());
    if (pass) {
      setRecoveredPass(pass);
    } else {
      setRecoveryError('Respuesta incorrecta o usuario no encontrado.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-black flex flex-col items-center justify-center p-4 select-none relative overflow-y-auto font-sans">
      {/* Neo-brutalist grids background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e3_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e3_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40 z-0 pointer-events-none" />

      <div className="w-full max-w-md bg-white border-4 border-black p-6 md:p-8 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10 transition-all duration-300">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-2xs font-mono rounded-none uppercase font-black uppercase tracking-wider">
            <Sparkles size={11} className="text-[#FF4D00]" /> Workspace Estático
          </div>
          <h1 className="font-serif font-black text-3xl tracking-tight leading-none text-black mt-1">
            BLOCKSI <span className="text-xs font-mono text-[#FF4D00] uppercase font-black tracking-widest block mt-1">SISTEMA DE SESIONES</span>
          </h1>
          <p className="text-2xs font-mono text-black/55 uppercase font-bold px-2">
            Notas, Recordatorios y Calendario Seguros con Sincronización en la Nube
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 border-2 border-black rounded-none overflow-hidden p-0.5 bg-[#F9F9F7]">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); clearCredentials(); }}
            className={`py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-none cursor-pointer transition-all ${
              activeTab === 'login' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'
            }`}
          >
            Ingresar
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('register'); clearCredentials(); }}
            className={`py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-none cursor-pointer transition-all ${
              activeTab === 'register' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'
            }`}
          >
            Registrarse
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('github'); clearCredentials(); }}
            className={`py-2 text-[10px] font-mono font-black uppercase tracking-wider rounded-none cursor-pointer transition-all flex items-center justify-center gap-1 ${
              activeTab === 'github' ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5'
            }`}
          >
            <FolderSync size={11} className={activeTab === 'github' ? 'text-[#FF4D00]' : ''} />
            Git Sync
          </button>
        </div>

        {/* Error/Success Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 border-2 border-black rounded-none text-xs font-mono font-bold text-red-700 flex items-center gap-2 uppercase leading-tight">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border-2 border-black rounded-none text-xs font-mono font-bold text-emerald-800 flex items-center gap-2 uppercase leading-tight">
            <Sparkles size={15} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Active Tab Forms */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Nombre de Usuario</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-black/40"><User size={15} /></span>
                <input
                  type="text"
                  required
                  placeholder="Escribe tu usuario..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none pl-9 pr-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-bold uppercase"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-black/40"><Key size={15} /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none pl-9 pr-10 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-black/40 hover:text-black"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setRecoveryUser(username);
                  setRecoveryAnswer('');
                  setRecoveredPass(null);
                  setRecoveryError('');
                  setShowRecoveryModal(true);
                }}
                className="text-[9px] font-mono font-black uppercase text-black/55 hover:text-[#FF4D00] tracking-wide"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              Iniciar Sesión
            </button>

            <div className="p-3 bg-[#F9F9F7] border-2 border-dashed border-black/40 rounded-none text-[10px] font-mono text-black/70 uppercase line-clamp-none leading-normal">
              <span className="font-black text-[#FF4D00] block mb-1">💡 ¿INICIANDO SESIÓN EN OTRO DISPOSITIVO?</span>
              Para cargar automáticamente tus notas y recordatorios en un nuevo dispositivo, utiliza la pestaña superior <span className="font-black text-black">"Git Sync"</span> con tus credenciales de GitHub conectadas. ¡Los datos se sincronizarán solos!
            </div>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Nombre de Usuario</label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="ej. CARLOS"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-bold uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-black text-black/60 uppercase block tracking-wider">Confirmar</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5 bg-[#F9F9F7] p-3 border-2 border-black">
              <label className="text-[10px] font-mono font-black text-[#FF4D00] uppercase flex items-center gap-1.5 block tracking-wider">
                <HelpCircle size={12} /> Pregunta de Seguridad Obligatoria
              </label>
              <p className="text-[10px] font-mono font-bold uppercase text-black/65 pb-1">
                ¿CUAL ES EL NOMBRE COMPLETO DE TUS PAPAS?
              </p>
              <input
                type="text"
                required
                placeholder="Escribe tu respuesta de recuperación..."
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full bg-white border-2 border-black rounded-none px-3 py-2 text-xs text-black focus:outline-none focus:border-[#FF4D00] placeholder-black/30 font-bold uppercase"
              />
              <span className="text-[8px] font-mono text-black/45 block pt-1 tracking-tight uppercase">
                * Se usa para recuperar el acceso de manera local en caso de olvido.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-[#FF4D00] text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              Registrar Cuenta Nueva
            </button>
          </form>
        )}

        {activeTab === 'github' && (
          <form onSubmit={handleGithubConnect} className="space-y-4">
            <p className="text-2xs font-mono font-bold text-black/55 uppercase leading-normal tracking-wide">
              Utiliza tu Token de GitHub para descargar tu archivo independiente <code className="font-bold text-black text-[10px]">blocksi-data-USUARIO.json</code> en este dispositivo y reanudar tus notas desde cualquier lugar.
            </p>

            <div className="grid grid-cols-2 gap-3 pb-1 border-b-2 border-black/10">
              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Usuario BLOCKSI</label>
                <input
                  type="text"
                  required
                  placeholder="ej. CARLOS"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-bold uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Contraseña BLOCKSI</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Usuario Git</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. theeliceo"
                    value={ghUser}
                    onChange={(e) => setGhUser(e.target.value)}
                    className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Repositorio Git</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. blocksi"
                    value={ghRepo}
                    onChange={(e) => setGhRepo(e.target.value)}
                    className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Token de Acceso (PAT)</label>
                  <input
                    type="password"
                    required
                    placeholder="ghp_xxxxxxxx"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Rama</label>
                  <input
                    type="text"
                    placeholder="main"
                    value={ghBranch}
                    onChange={(e) => setGhBranch(e.target.value)}
                    className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none placeholder-black/30 font-serif"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGitHubSyncing}
              className="w-full py-3 bg-[#FF4D00] hover:bg-black text-white border-2 border-black rounded-none text-xs font-serif font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {isGitHubSyncing ? 'Buscando y Descargando...' : '📥 Importar y Conectar Sincronización'}
            </button>
          </form>
        )}
      </div>

      {/* Password Recovery Modal Overlay */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-60">
            
            <div className="flex items-center gap-2 text-[#FF4D00] border-b-2 border-black pb-2">
              <HelpCircle size={20} className="shrink-0 animate-bounce" />
              <h3 className="font-serif font-black text-sm text-black uppercase tracking-tight">Recuperar Contraseña</h3>
            </div>

            <form onSubmit={handleRecoverPassword} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono font-black text-black/60 uppercase block">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  placeholder="Tu usuario..."
                  value={recoveryUser}
                  onChange={(e) => setRecoveryUser(e.target.value.replace(/\s+/g, ''))}
                  className="w-full bg-[#F9F9F7] border-2 border-black rounded-none px-3 py-1.5 text-xs text-black focus:outline-none font-bold uppercase"
                />
              </div>

              <div className="space-y-1.5 bg-[#F9F9F7] p-2.5 border-2 border-black">
                <p className="text-[9px] font-mono font-black text-[#FF4D00] uppercase tracking-wider">Pregunta Secreta:</p>
                <p className="text-[10px] font-mono font-bold uppercase text-black leading-tight">
                  ¿CUAL ES EL NOMBRE COMPLETO DE TUS PAPAS?
                </p>
                <input
                  type="text"
                  required
                  placeholder="Tu respuesta de seguridad..."
                  value={recoveryAnswer}
                  onChange={(e) => setRecoveryAnswer(e.target.value)}
                  className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 mt-1 text-xs text-black focus:outline-none font-bold uppercase"
                />
              </div>

              {recoveryError && (
                <p className="text-[9px] font-mono font-black uppercase text-red-600 bg-red-50 p-2 border border-red-200">
                  {recoveryError}
                </p>
              )}

              {recoveredPass !== null && (
                <div className="p-3 bg-emerald-50 border-2 border-black text-center space-y-1">
                  <p className="text-[9px] font-mono font-black uppercase text-[#10B981] tracking-wide">Contraseña Recuperada:</p>
                  <p className="font-mono font-black text-lg text-black bg-white border border-black p-1.5 select-all">{recoveredPass}</p>
                  <p className="text-[8px] font-mono text-black/50 uppercase">Haz doble clic para copiar</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-3.5 py-1.5 border-2 border-black bg-white hover:bg-black/5 text-black font-mono font-black text-[10px] uppercase cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 border-2 border-black bg-black text-white hover:bg-[#FF4D00] font-mono font-black text-[10px] uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                >
                  Verificar Respuesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
