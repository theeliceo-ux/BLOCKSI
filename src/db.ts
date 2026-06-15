import { Note, Reminder, NoteVersion, HistoryEvent, HistoryEventType, Category, Tag, AppSettings } from './types';

// Default Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Personal', slug: 'personal', color: 'indigo' },
  { id: '2', name: 'Trabajo', slug: 'trabajo', color: 'amber' },
  { id: '3', name: 'Escuela', slug: 'escuela', color: 'emerald' },
  { id: '4', name: 'Finanzas', slug: 'finanzas', color: 'rose' },
  { id: '5', name: 'Salud', slug: 'salud', color: 'teal' },
  { id: '6', name: 'Proyectos', slug: 'proyectos', color: 'purple' },
];

const DEFAULT_TAGS: Tag[] = [
  { id: '1', name: 'Trabajo' },
  { id: '2', name: 'Personal' },
  { id: '3', name: 'Ideas' },
  { id: '4', name: 'Proyecto' },
  { id: '5', name: 'Escuela' },
  { id: '6', name: 'Urgente' },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  language: 'es',
  fontSize: 'md',
  notificationsEnabled: true,
  autoBackup: false,
  githubUsername: '',
  githubRepo: '',
  githubBranch: 'main',
  githubToken: '',
  githubPath: 'blocksi-data.json',
  githubEnabled: false,
};

// Seed Helper Dates
// We want seed dates relative to the active date (June 2026 as per metadata if possible,
// but let's dynamically anchor to June 2026 or current year, e.g. 2026-06-11)
const getLocalDateStringNoUTC = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSeedDates = () => {
  const base = new Date('2026-06-11T12:00:00');
  const formatDateStr = (d: Date) => getLocalDateStringNoUTC(d);
  const formatTimeStr = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

  const d0 = base; // Today
  const dMinus1 = new Date(base.getTime() - 24 * 60 * 60 * 1000); // Yesterday
  const dMinus2 = new Date(base.getTime() - 48 * 60 * 60 * 1000); // 2 days ago
  const dPlus1 = new Date(base.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const dPlus3 = new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000); // Three days later

  return {
    todayDate: formatDateStr(d0),
    todayTime: formatTimeStr(d0),
    yesterdayDate: formatDateStr(dMinus1),
    yesterdayTime: formatTimeStr(dMinus1),
    twoDaysAgoDate: formatDateStr(dMinus2),
    twoDaysAgoTime: formatTimeStr(dMinus2),
    tomorrowDate: formatDateStr(dPlus1),
    tomorrowTime: formatTimeStr(dPlus1),
    threeDaysLaterDate: formatDateStr(dPlus3),
  };
};

const seeds = getSeedDates();

const SEED_NOTES: Note[] = [
  {
    id: 'n1',
    title: '💡 Ideas para el desarrollo de BLOCKSI',
    content: `# Ideas clave para BLOCKSI

BLOCKSI es una PWA pensada para la organización definitiva. Aquí describo las principales funciones propuestas:

- [x] Soporte IndexedDB y LocalStorage
- [x] Editor local con formato enriquecido (Markdown-like)
- [x] Notificaciones para alertas y recordatorios
- [ ] Integración de gráficos de productividad semanales

## Tecnologías principales
* React + TypeScript + Tailwind CSS
* Lucide React para iconografía estilizada
* Framer Motion para transiciones fluidas en dispositivos iPhone

> "La genialidad comienza en la simplicidad estructurada."`,
    createdAt: seeds.todayDate,
    createdTime: '09:30',
    modifiedAt: seeds.todayDate,
    modifiedTime: '10:45',
    wordCount: 75,
    charCount: 520,
    category: 'Proyectos',
    tags: ['Ideas', 'Proyecto'],
    status: 'active',
    color: '#8b5cf6', // purple
    favorite: true,
  },
  {
    id: 'n2',
    title: '🛒 Lista de compras de provisiones',
    content: `# Compras sugeridas para la semana

Por favor, comprar las verduras frescas en el mercado local y las carnes en la tienda de confianza:

### Verdulería
- [x] Aguacates maduros (3 unidades)
- [ ] Tomates cherry (1 caja)
- [ ] Espárragos frescos
- [ ] Limones y cilantro para aderezo

### Despensa
- [ ] Café en grano de altura (Tostado medio)
- [ ] Aceite de oliva virgen extra
- [x] Avena integral

*Recordar llevar las bolsas ecológicas reutilizables.*`,
    createdAt: seeds.yesterdayDate,
    createdTime: '18:15',
    modifiedAt: seeds.yesterdayDate,
    modifiedTime: '18:22',
    wordCount: 72,
    charCount: 462,
    category: 'Personal',
    tags: ['Personal'],
    status: 'active',
    color: '#6366f1', // indigo
    favorite: false,
  },
  {
    id: 'n3',
    title: '📑 Resumen del proyecto Rocket',
    content: `# Acta de Revisión de Diseño - Proyecto Rocket

Asistentes: Director de TI, Diseñador UX, Desarrollador Principal.

## Acuerdos clave:
1. El lanzamiento de la primera beta privada se programará para finales de mes.
2. Es obligatorio mantener compatibilidad completa con Safari en iOS 17+.
3. El motor de sincronización de datos debe correr de forma asíncrona.

### Tareas Asignadas:
- **UX/UI:** Finalizar mockups de la vista calendario.
- **Desarrollo:** Diseñar esquema relacional y llaves foráneas.
- **QA:** Ejecutar pruebas de carga offline.`,
    createdAt: seeds.twoDaysAgoDate,
    createdTime: '14:00',
    modifiedAt: seeds.todayDate,
    modifiedTime: '11:15',
    wordCount: 94,
    charCount: 597,
    category: 'Trabajo',
    tags: ['Trabajo', 'Urgente'],
    status: 'active',
    color: '#f59e0b', // amber
    favorite: true,
  },
  {
    id: 'n4',
    title: '🎓 Apuntes de Clase: Redes Neuronales',
    content: `# Introducción a Redes Neuronales Artificiales

Notas tomadas durante la clase de Inteligencia Artificial del Profesor Gómez.

## Conceptos fundamentales
* **Perceptrón:** La unidad básica de procesamiento lógico.
* **Función de Activación:** Introduce la no-linealidad en la red (ReLU, Sigmoide).
* **Backpropagation:** Algoritmo de retropropagación utilizado para ajustar los pesos mediante gradiente descendente.

### Bibliografía recomendada:
- "Deep Learning" por Ian Goodfellow.
- Capítulos 3 y 4 de la guía de estudio en línea.`,
    createdAt: seeds.twoDaysAgoDate,
    createdTime: '10:00',
    modifiedAt: seeds.twoDaysAgoDate,
    modifiedTime: '11:30',
    wordCount: 82,
    charCount: 560,
    category: 'Escuela',
    tags: ['Escuela'],
    status: 'active',
    color: '#10b981', // emerald
    favorite: false,
  },
];

const SEED_VERSIONS: NoteVersion[] = [
  {
    id: 'v1',
    noteId: 'n3',
    title: '📑 Minuta de Proyecto Rocket (Versión Inicial)',
    content: `# Acta de Revisión de Diseño - Proyecto Rocket
Pendiente de definir los asistentes y temas a discutir. Lanzamiento de beta planificado para el siguiente año.`,
    modifiedAt: seeds.twoDaysAgoDate,
    modifiedTime: '14:00',
    changeSummary: 'Creación inicial de la nota de minuta.',
  },
  {
    id: 'v2',
    noteId: 'n3',
    title: '📑 Resumen del proyecto Rocket (Ajustes de Beta)',
    content: `# Acta de Revisión de Diseño - Proyecto Rocket

Asistentes: Director de TI, Diseñador UX.
1. Primera beta privada programada para finales de este mes.
2. Compatibilidad inicial con navegadores modernos.`,
    modifiedAt: seeds.yesterdayDate,
    modifiedTime: '09:45',
    changeSummary: 'Se agregaron asistentes e información de compatibilidad.',
  }
];

const SEED_REMINDERS: Reminder[] = [
  {
    id: 'r1',
    title: 'Reunión de revisión semanal Rocket',
    description: 'Revisar avances del acta de diseño con el equipo de de desarrollo.',
    date: seeds.todayDate,
    time: '15:00',
    priority: 'high',
    category: 'Trabajo',
    status: 'pending',
    repeat: 'weekly',
    linkedNoteId: 'n3',
  },
  {
    id: 'r2',
    title: 'Preparar presentación para escuela',
    description: 'Estructurar apuntes tomados sobre las funciones de activación neural.',
    date: seeds.tomorrowDate,
    time: '18:00',
    priority: 'medium',
    category: 'Escuela',
    status: 'pending',
    repeat: 'once',
    linkedNoteId: 'n4',
  },
  {
    id: 'r3',
    title: 'Tomar 2L de agua diarios',
    description: 'Mantener salud y bienestar hidratándose regularmente durante el día.',
    date: seeds.todayDate,
    time: '08:00',
    priority: 'low',
    category: 'Salud',
    status: 'completed',
    repeat: 'daily',
  },
  {
    id: 'r4',
    title: 'Revisar balance de finanzas',
    description: 'Análisis de gastos de tarjetas de crédito y presupuesto de ahorro.',
    date: seeds.todayDate,
    time: '20:00',
    priority: 'high',
    category: 'Finanzas',
    status: 'pending',
    repeat: 'monthly',
  }
];

const SEED_HISTORY: HistoryEvent[] = [
  {
    id: 'h1',
    timestamp: new Date('2026-06-09T10:00:00').toISOString(),
    type: 'note_created',
    details: 'Nota de redes neuronales creada.',
    entityId: 'n4',
    entityTitle: '🎓 Apuntes de Clase: Redes Neuronales',
  },
  {
    id: 'h2',
    timestamp: new Date('2026-06-09T14:00:00').toISOString(),
    type: 'note_created',
    details: 'Nota de proyecto Rocket iniciada.',
    entityId: 'n3',
    entityTitle: '📑 Resumen del proyecto Rocket',
  },
  {
    id: 'h3',
    timestamp: new Date('2026-06-10T18:15:00').toISOString(),
    type: 'note_created',
    details: 'Lista de compras semanal creada.',
    entityId: 'n2',
    entityTitle: '🛒 Lista de compras de provisiones',
  },
  {
    id: 'h4',
    timestamp: new Date('2026-06-11T09:30:00').toISOString(),
    type: 'note_created',
    details: 'Nota sobre ideas de BLOCKSI creada.',
    entityId: 'n1',
    entityTitle: '💡 Ideas para el desarrollo de BLOCKSI',
  },
  {
    id: 'h5',
    timestamp: new Date('2026-06-11T10:45:00').toISOString(),
    type: 'note_edited',
    details: 'Ideas de BLOCKSI actualizadas con formato Markdown ampliado.',
    entityId: 'n1',
    entityTitle: '💡 Ideas para el desarrollo de BLOCKSI',
  },
  {
    id: 'h6',
    timestamp: new Date('2026-06-11T11:15:00').toISOString(),
    type: 'note_edited',
    details: 'Se modificó el acta del proyecto Rocket agregando responsables de QA.',
    entityId: 'n3',
    entityTitle: '📑 Resumen del proyecto Rocket',
  },
  {
    id: 'h7',
    timestamp: new Date('2026-06-11T11:20:00').toISOString(),
    type: 'reminder_created',
    details: 'Recordatorio semanal del proyecto Rocket creado y vinculado.',
    entityId: 'r1',
    entityTitle: 'Reunión de revisión semanal Rocket',
  },
  {
    id: 'h8',
    timestamp: new Date('2026-06-11T12:00:00').toISOString(),
    type: 'reminder_completed',
    details: 'Se completó el recordatorio de beber agua.',
    entityId: 'r3',
    entityTitle: 'Tomar 2L de agua diarios',
  }
];

// Local Storage Keys
const KEYS = {
  NOTES: 'blocksi_notes',
  REMINDERS: 'blocksi_reminders',
  VERSIONS: 'blocksi_versions',
  HISTORY: 'blocksi_history',
  CATEGORIES: 'blocksi_categories',
  TAGS: 'blocksi_tags',
  SETTINGS: 'blocksi_settings',
};

// Database class to handle all queries synchronously with cache sync
class BlocksiDB {
  public activeUser: string | null = null;
  private cache = {
    notes: [] as Note[],
    reminders: [] as Reminder[],
    versions: [] as NoteVersion[],
    history: [] as HistoryEvent[],
    categories: [] as Category[],
    tags: [] as Tag[],
    settings: DEFAULT_SETTINGS as AppSettings,
  };

  constructor() {
    this.init();
  }

  // Account system actions
  getAccounts(): Array<{ username: string; passwordHash: string; securityAnswer: string }> {
    try {
      const saved = localStorage.getItem('blocksi_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveAccounts(accounts: Array<{ username: string; passwordHash: string; securityAnswer: string }>) {
    localStorage.setItem('blocksi_accounts', JSON.stringify(accounts));
  }

  registerUser(username: string, passwordHash: string, securityAnswer: string): boolean {
    const accs = this.getAccounts();
    const normalized = username.toLowerCase().trim();
    if (accs.some((a) => a.username === normalized)) {
      return false;
    }
    accs.push({ username: normalized, passwordHash, securityAnswer });
    this.saveAccounts(accs);
    return true;
  }

  loginUser(username: string, passwordHash: string): boolean {
    const accs = this.getAccounts();
    const normalized = username.toLowerCase().trim();
    const user = accs.find((a) => a.username === normalized);
    if (!user) return false;
    return user.passwordHash === passwordHash;
  }

  recoverPassword(username: string, securityAnswer: string): string | null {
    const accs = this.getAccounts();
    const normalized = username.toLowerCase().trim();
    const user = accs.find((a) => a.username === normalized);
    if (!user) return null;
    if (user.securityAnswer.toLowerCase().trim() === securityAnswer.toLowerCase().trim()) {
      return user.passwordHash;
    }
    return null;
  }

  getUserPassword(username: string): string {
    const accs = this.getAccounts();
    const user = accs.find((a) => a.username === username.toLowerCase().trim());
    return user ? user.passwordHash : '';
  }

  getUserSecurityAnswer(username: string): string {
    const accs = this.getAccounts();
    const user = accs.find((a) => a.username === username.toLowerCase().trim());
    return user ? user.securityAnswer : '';
  }

  logout() {
    this.activeUser = null;
    localStorage.removeItem('blocksi_active_user');
    this.cache = {
      notes: [],
      reminders: [],
      versions: [],
      history: [],
      categories: [...DEFAULT_CATEGORIES],
      tags: [...DEFAULT_TAGS],
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  loadUser(username: string) {
    this.activeUser = username.toLowerCase().trim();
    localStorage.setItem('blocksi_active_user', this.activeUser);

    const userKeys = {
      NOTES: `blocksi_notes_${this.activeUser}`,
      REMINDERS: `blocksi_reminders_${this.activeUser}`,
      VERSIONS: `blocksi_versions_${this.activeUser}`,
      HISTORY: `blocksi_history_${this.activeUser}`,
      CATEGORIES: `blocksi_categories_${this.activeUser}`,
      TAGS: `blocksi_tags_${this.activeUser}`,
      SETTINGS: `blocksi_settings_${this.activeUser}`,
    };

    // Load settings
    const savedSettings = localStorage.getItem(userKeys.SETTINGS);
    if (savedSettings) {
      this.cache.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    } else {
      const initialSettings = {
        ...DEFAULT_SETTINGS,
        githubPath: `blocksi-data-${this.activeUser}.json`,
      };
      localStorage.setItem(userKeys.SETTINGS, JSON.stringify(initialSettings));
      this.cache.settings = initialSettings;
    }

    // Load categories
    const savedCats = localStorage.getItem(userKeys.CATEGORIES);
    if (savedCats) {
      this.cache.categories = JSON.parse(savedCats);
    } else {
      localStorage.setItem(userKeys.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      this.cache.categories = [...DEFAULT_CATEGORIES];
    }

    // Load tags
    const savedTags = localStorage.getItem(userKeys.TAGS);
    if (savedTags) {
      this.cache.tags = JSON.parse(savedTags);
    } else {
      localStorage.setItem(userKeys.TAGS, JSON.stringify(DEFAULT_TAGS));
      this.cache.tags = [...DEFAULT_TAGS];
    }

    // Load notes
    const savedNotes = localStorage.getItem(userKeys.NOTES);
    if (savedNotes) {
      this.cache.notes = JSON.parse(savedNotes);
    } else {
      localStorage.setItem(userKeys.NOTES, JSON.stringify(SEED_NOTES));
      this.cache.notes = [...SEED_NOTES];
    }

    // Load versions
    const savedVers = localStorage.getItem(userKeys.VERSIONS);
    if (savedVers) {
      this.cache.versions = JSON.parse(savedVers);
    } else {
      localStorage.setItem(userKeys.VERSIONS, JSON.stringify(SEED_VERSIONS));
      this.cache.versions = [...SEED_VERSIONS];
    }

    // Load reminders
    const savedRems = localStorage.getItem(userKeys.REMINDERS);
    if (savedRems) {
      this.cache.reminders = JSON.parse(savedRems);
    } else {
      localStorage.setItem(userKeys.REMINDERS, JSON.stringify(SEED_REMINDERS));
      this.cache.reminders = [...SEED_REMINDERS];
    }

    // Load history
    const savedHist = localStorage.getItem(userKeys.HISTORY);
    if (savedHist) {
      this.cache.history = JSON.parse(savedHist);
    } else {
      localStorage.setItem(userKeys.HISTORY, JSON.stringify(SEED_HISTORY));
      this.cache.history = [...SEED_HISTORY];
    }
  }

  private init() {
    try {
      const active = localStorage.getItem('blocksi_active_user');
      if (active) {
        this.loadUser(active);
      } else {
        this.cache = {
          notes: [],
          reminders: [],
          versions: [],
          history: [],
          categories: [...DEFAULT_CATEGORIES],
          tags: [...DEFAULT_TAGS],
          settings: { ...DEFAULT_SETTINGS },
        };
      }
    } catch (e) {
      console.error('Storage initialization failed. Carrying forward with in-memory fallback.', e);
    }
  }

  private persist(key: string, data: any) {
    if (!this.activeUser) return;
    const userKey = `${key}_${this.activeUser}`;
    try {
      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Persist failed, local quota full or private browser mode:', e);
    }
  }

  // Settings
  getSettings(): AppSettings {
    return this.cache.settings;
  }

  saveSettings(settings: AppSettings) {
    this.cache.settings = settings;
    this.persist(KEYS.SETTINGS, settings);
    this.logHistory('settings_updated', 'Configuración de la aplicación actualizada.');
  }

  // Categories
  getCategories(): Category[] {
    return this.cache.categories;
  }

  saveCategory(cat: Category) {
    const idx = this.cache.categories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      this.cache.categories[idx] = cat;
    } else {
      this.cache.categories.push(cat);
    }
    this.persist(KEYS.CATEGORIES, this.cache.categories);
  }

  deleteCategory(id: string) {
    this.cache.categories = this.cache.categories.filter((c) => c.id !== id);
    this.persist(KEYS.CATEGORIES, this.cache.categories);
  }

  // Tags
  getTags(): Tag[] {
    return this.cache.tags;
  }

  saveTag(tag: Tag) {
    const idx = this.cache.tags.findIndex((t) => t.id === tag.id || t.name.toLowerCase() === tag.name.toLowerCase());
    if (idx >= 0) {
      this.cache.tags[idx] = tag;
    } else {
      this.cache.tags.push(tag);
    }
    this.persist(KEYS.TAGS, this.cache.tags);
  }

  deleteTag(id: string) {
    this.cache.tags = this.cache.tags.filter((t) => t.id !== id);
    this.persist(KEYS.TAGS, this.cache.tags);
  }

  // Notes
  getNotes(): Note[] {
    return this.cache.notes;
  }

  getNoteById(id: string): Note | undefined {
    return this.cache.notes.find((n) => n.id === id);
  }

  saveNote(note: Note, isAutoSave = false, logText = '') {
    const orig = this.cache.notes.find((n) => n.id === note.id);
    const date = new Date();
    const currentDateStr = getLocalDateStringNoUTC(date);
    const currentTimeStr = date.toTimeString().split(' ')[0].substring(0, 5);

    const updatedNote: Note = {
      ...note,
      modifiedAt: currentDateStr,
      modifiedTime: currentTimeStr,
    };

    // If edited and significant change, let's trigger version storage
    if (orig && (orig.title !== note.title || orig.content !== note.content)) {
      // Create version representation
      const version: NoteVersion = {
        id: 'v_' + Math.random().toString(36).substr(2, 9),
        noteId: orig.id,
        title: orig.title,
        content: orig.content,
        modifiedAt: orig.modifiedAt,
        modifiedTime: orig.modifiedTime,
        changeSummary: logText || `Edición del contenido (${note.wordCount} palabras)`,
      };
      this.cache.versions.push(version);
      this.persist(KEYS.VERSIONS, this.cache.versions);
    }

    if (orig) {
      const idx = this.cache.notes.findIndex((n) => n.id === note.id);
      this.cache.notes[idx] = updatedNote;
      if (!isAutoSave) {
        this.logHistory('note_edited', `Nota "${updatedNote.title}" modificada.`, updatedNote.id, updatedNote.title);
      }
    } else {
      this.cache.notes.unshift(updatedNote);
      this.logHistory('note_created', `Nota "${updatedNote.title}" creada.`, updatedNote.id, updatedNote.title);
    }

    this.persist(KEYS.NOTES, this.cache.notes);
    return updatedNote;
  }

  deleteNote(id: string) {
    const note = this.cache.notes.find((n) => n.id === id);
    if (note) {
      note.status = 'trash';
      note.deletedAt = new Date().toISOString();
      this.persist(KEYS.NOTES, this.cache.notes);
      this.logHistory('note_deleted', `Nota "${note.title}" trasladada a la papelera.`, note.id, note.title);
    }
  }

  restoreNote(id: string) {
    const note = this.cache.notes.find((n) => n.id === id);
    if (note) {
      note.status = 'active';
      delete note.deletedAt;
      this.persist(KEYS.NOTES, this.cache.notes);
      this.logHistory('note_restored', `Nota "${note.title}" restaurada con éxito.`, note.id, note.title);
    }
  }

  purgeNote(id: string) {
    const note = this.cache.notes.find((n) => n.id === id);
    this.cache.notes = this.cache.notes.filter((n) => n.id !== id);
    this.persist(KEYS.NOTES, this.cache.notes);

    // Also purge its Versions
    this.cache.versions = this.cache.versions.filter((v) => v.noteId !== id);
    this.persist(KEYS.VERSIONS, this.cache.versions);

    // Unlink any reminders
    this.cache.reminders = this.cache.reminders.map((r) => {
      if (r.linkedNoteId === id) {
        return { ...r, linkedNoteId: undefined };
      }
      return r;
    });
    this.persist(KEYS.REMINDERS, this.cache.reminders);

    if (note) {
      this.logHistory('note_purged', `Nota "${note.title}" purgada definitivamente de la papelera.`, id, note.title);
    }
  }

  // Note Versions
  getVersions(noteId: string): NoteVersion[] {
    return this.cache.versions
      .filter((v) => v.noteId === noteId)
      .sort((a, b) => {
        const timeA = new Date(`${a.modifiedAt}T${a.modifiedTime}`).getTime();
        const timeB = new Date(`${b.modifiedAt}T${b.modifiedTime}`).getTime();
        return timeB - timeA; // Descending (latest first)
      });
  }

  restoreVersion(versionId: string): Note | null {
    const version = this.cache.versions.find((v) => v.id === versionId);
    if (!version) return null;

    const note = this.cache.notes.find((n) => n.id === version.noteId);
    if (!note) return null;

    // Before restoring, write current note as a version so we don't lose it
    const backupVersion: NoteVersion = {
      id: 'v_' + Math.random().toString(36).substr(2, 9),
      noteId: note.id,
      title: note.title,
      content: note.content,
      modifiedAt: note.modifiedAt,
      modifiedTime: note.modifiedTime,
      changeSummary: `Copia de seguridad antes de restaurar versión del ${version.modifiedAt} ${version.modifiedTime}`,
    };
    this.cache.versions.push(backupVersion);
    this.persist(KEYS.VERSIONS, this.cache.versions);

    // Apply previous attributes
    note.title = version.title;
    note.content = version.content;
    note.wordCount = version.content.split(/\s+/).filter(Boolean).length;
    note.charCount = version.content.length;

    const date = new Date();
    note.modifiedAt = getLocalDateStringNoUTC(date);
    note.modifiedTime = date.toTimeString().split(' ')[0].substring(0, 5);

    this.persist(KEYS.NOTES, this.cache.notes);
    this.logHistory('note_edited', `Nota "${note.title}" restaurada a versión anterior del ${version.modifiedAt} ${version.modifiedTime}.`, note.id, note.title);
    return note;
  }

  // Reminders
  getReminders(): Reminder[] {
    return this.cache.reminders;
  }

  saveReminder(rem: Reminder) {
    const idx = this.cache.reminders.findIndex((r) => r.id === rem.id);
    if (idx >= 0) {
      const old = this.cache.reminders[idx];
      this.cache.reminders[idx] = rem;
      this.logHistory(
        rem.status === 'completed' && old.status !== 'completed' ? 'reminder_completed' : 'reminder_created',
        `Recordatorio "${rem.title}" actualizado.`,
        rem.id,
        rem.title
      );
    } else {
      this.cache.reminders.push(rem);
      this.logHistory('reminder_created', `Recordatorio "${rem.title}" programado para el ${rem.date}.`, rem.id, rem.title);
    }
    this.persist(KEYS.REMINDERS, this.cache.reminders);
  }

  deleteReminder(id: string) {
    const rem = this.cache.reminders.find((r) => r.id === id);
    if (rem) {
      rem.status = 'trash';
      rem.deletedAt = new Date().toISOString();
      this.persist(KEYS.REMINDERS, this.cache.reminders);
      this.logHistory('reminder_deleted', `Recordatorio "${rem.title}" trasladado a la papelera.`, rem.id, rem.title);
    }
  }

  restoreReminder(id: string) {
    const rem = this.cache.reminders.find((r) => r.id === id);
    if (rem) {
      rem.status = 'pending';
      delete rem.deletedAt;
      this.persist(KEYS.REMINDERS, this.cache.reminders);
      this.logHistory('reminder_restored', `Recordatorio "${rem.title}" reactivado desde la papelera.`, rem.id, rem.title);
    }
  }

  purgeReminder(id: string) {
    const rem = this.cache.reminders.find((r) => r.id === id);
    this.cache.reminders = this.cache.reminders.filter((r) => r.id !== id);
    this.persist(KEYS.REMINDERS, this.cache.reminders);
    if (rem) {
      this.logHistory('reminder_purged', `Recordatorio "${rem.title}" eliminado de forma definitiva.`, id, rem.title);
    }
  }

  // History Logger
  getHistory(): HistoryEvent[] {
    return this.cache.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logHistory(type: HistoryEventType, details: string, entityId?: string, entityTitle?: string) {
    const newLog: HistoryEvent = {
      id: 'h_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      details,
      entityId,
      entityTitle,
    };
    this.cache.history.push(newLog);
    this.persist(KEYS.HISTORY, this.cache.history);
  }

  clearHistory() {
    this.cache.history = [];
    this.persist(KEYS.HISTORY, []);
  }

  // Data Actions
  clearDatabase() {
    this.cache.notes = [];
    this.cache.reminders = [];
    this.cache.versions = [];
    this.cache.history = [];
    this.cache.categories = DEFAULT_CATEGORIES;
    this.cache.tags = DEFAULT_TAGS;
    this.cache.settings = DEFAULT_SETTINGS;

    if (this.activeUser) {
      const activeSuffix = `_${this.activeUser}`;
      localStorage.removeItem(KEYS.NOTES + activeSuffix);
      localStorage.removeItem(KEYS.REMINDERS + activeSuffix);
      localStorage.removeItem(KEYS.VERSIONS + activeSuffix);
      localStorage.removeItem(KEYS.HISTORY + activeSuffix);
      localStorage.removeItem(KEYS.CATEGORIES + activeSuffix);
      localStorage.removeItem(KEYS.TAGS + activeSuffix);
      localStorage.removeItem(KEYS.SETTINGS + activeSuffix);
    }

    this.logHistory('db_cleared', 'Base de datos local completamente reiniciada a valores predeterminados.');
  }

  exportData(): string {
    const dump = {
      notes: this.cache.notes,
      reminders: this.cache.reminders,
      versions: this.cache.versions,
      history: this.cache.history,
      categories: this.cache.categories,
      tags: this.cache.tags,
      settings: this.cache.settings,
      exportedAt: new Date().toISOString(),
      app: 'BLOCKSI',
      username: this.activeUser,
      password: this.activeUser ? this.getUserPassword(this.activeUser) : '',
      securityAnswer: this.activeUser ? this.getUserSecurityAnswer(this.activeUser) : ''
    };
    return JSON.stringify(dump, null, 2);
  }

  importData(jsonContent: string): boolean {
    try {
      const dump = JSON.parse(jsonContent);
      if (dump.app !== 'BLOCKSI') {
        throw new Error('Formato de importación no válido. Asegúrese de usar un archivo exportado de BLOCKSI.');
      }

      if (Array.isArray(dump.notes)) this.cache.notes = dump.notes;
      if (Array.isArray(dump.reminders)) this.cache.reminders = dump.reminders;
      if (Array.isArray(dump.versions)) this.cache.versions = dump.versions;
      if (Array.isArray(dump.history)) this.cache.history = dump.history;
      if (Array.isArray(dump.categories)) this.cache.categories = dump.categories;
      if (Array.isArray(dump.tags)) this.cache.tags = dump.tags;
      if (dump.settings) this.cache.settings = { ...DEFAULT_SETTINGS, ...dump.settings };

      this.persist(KEYS.NOTES, this.cache.notes);
      this.persist(KEYS.REMINDERS, this.cache.reminders);
      this.persist(KEYS.VERSIONS, this.cache.versions);
      this.persist(KEYS.HISTORY, this.cache.history);
      this.persist(KEYS.CATEGORIES, this.cache.categories);
      this.persist(KEYS.TAGS, this.cache.tags);
      this.persist(KEYS.SETTINGS, this.cache.settings);

      // Restore credentials to local registry if they exist inside the imported file
      if (dump.username && dump.password && dump.securityAnswer) {
        const accs = this.getAccounts();
        const norm = dump.username.toLowerCase().trim();
        const existingIdx = accs.findIndex((a) => a.username === norm);
        if (existingIdx >= 0) {
          accs[existingIdx] = { username: norm, passwordHash: dump.password, securityAnswer: dump.securityAnswer };
        } else {
          accs.push({ username: norm, passwordHash: dump.password, securityAnswer: dump.securityAnswer });
        }
        this.saveAccounts(accs);
      }

      this.logHistory('db_imported', 'Copia de seguridad local importada exitosamente.');
      return true;
    } catch (e) {
      console.error('Import process failed:', e);
      return false;
    }
  }
}

export const db = new BlocksiDB();
