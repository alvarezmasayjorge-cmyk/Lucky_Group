import { db } from './firebase'
import { collection, doc, writeBatch, getDocs, query, limit, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { TEMPLATE_SECTIONS, TEMPLATE_TASKS } from './templateTasks'

// Tasks to patch into existing clients (added after initial seeding)
const PATCH_V1 = {
  'AGNEW': [
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
  ],
  'BLOOMFIELD': [
    { titulo: 'Waiting for Raw Videos', sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', responsable_rol: 'Client', completed: false },
  ],
  'GRASS LAKE': [
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
  ],
  'DELTA': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
  ],
  'ECKERT': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
  ],
  'MOORE': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
  ],
  'MESA': [
    { titulo: 'Create New Landing Page (@Julius)',              sectionName: '4. LANDING PAGE',      responsable_rol: 'Funneler',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',                     sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'Funneler',      completed: false },
    {
      titulo: '[In Progress] Create Doctor Video — Long (@Jorge)',
      renameFrom: 'Create Doctor Video — Long (@Jorge)',
      sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false,
    },
    { titulo: 'Create Doctor Video — Short (@Jorge)',           sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',       sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)',         sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor', completed: true  },
  ],
  'PURE SEOUL': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Client', completed: false },
  ],
  'NAPLES IDEAL FITNESS': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Client', completed: false },
  ],
  'AGE REVERSAL TECHNOLOGY CENTER': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Client', completed: false },
  ],
}

export const runPatchV1 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v1_missing_tasks_r2')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return // already applied

  console.log('Running patch v1: adding missing tasks...')

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  // Build set of existing "clientId|titulo" to avoid duplicates
  const existingKeys = new Set(tasksSnap.docs.map(d => `${d.data().client_id}|${d.data().titulo}`))

  const batch = writeBatch(db)
  const now = new Date().toISOString()
  let count = 0

  // Build a map of clientId|titulo → docId for rename lookups
  const existingDocMap = {}
  tasksSnap.docs.forEach(d => {
    existingDocMap[`${d.data().client_id}|${d.data().titulo}`] = d.id
  })

  for (const client of clients) {
    const patchList = PATCH_V1[client.name]
    if (!patchList) continue

    for (const task of patchList) {
      const finalKey = `${client.id}|${task.titulo}`

      // If the target title already exists, skip
      if (existingKeys.has(finalKey)) continue

      const section = sections.find(s => s.nombre === task.sectionName)
      if (!section) { console.warn(`Section not found: ${task.sectionName}`); continue }

      // If renameFrom exists and the old title is present, update it instead of creating
      if (task.renameFrom) {
        const oldKey = `${client.id}|${task.renameFrom}`
        const oldDocId = existingDocMap[oldKey]
        if (oldDocId) {
          batch.update(doc(db, 'checklist_tasks', oldDocId), {
            titulo: task.titulo,
            actualizado_en: now,
          })
          count++
          continue
        }
      }

      // Create new task
      const taskRef = doc(collection(db, 'checklist_tasks'))
      batch.set(taskRef, {
        titulo: task.titulo,
        responsable_rol: task.responsable_rol,
        seccion_id: section.id,
        client_id: client.id,
        completed: task.completed,
        prioridad: 'medium',
        responsable_id: null,
        creado_por: userId,
        creado_en: now,
        actualizado_en: now,
      })
      count++
    }
  }

  // Mark patch as applied
  batch.set(patchRef, { applied_at: now, applied_by: userId, tasks_added: count })
  await batch.commit()
  console.log(`Patch v1 applied: ${count} tasks added.`)
}

const CLIENT_UPDATES = {
  'AGNEW': {
    overrides: [
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' }
    ]
  },
  'BLOOMFIELD': {
    overrides: [
      { title: 'Waiting for Raw Videos', role: 'Client', alias: 'Client' }
    ]
  },
  'GRASS LAKE': {
    overrides: [
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' }
    ]
  },
  'DELTA': {
    overrides: [
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true }
    ]
  },
  'ECKERT': {
    overrides: [
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true }
    ]
  },
  'MOORE': {
    overrides: [
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true }
    ]
  },
  'MESA': {
    overrides: [
      { title: 'Create New Landing Page', role: 'Funneler', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'Funneler', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor', alias: 'Jorge', inProgress: true },
      { title: 'Create Doctor Video — Short', role: 'Video Editor', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor', alias: 'Jorge', completed: true }
    ]
  },
  'PURE SEOUL': {
    overrides: [
      { title: 'Onboarding', role: 'Client', alias: 'Client' }
    ]
  },
  'NAPLES IDEAL FITNESS': {
    overrides: [
      { title: 'Onboarding', role: 'Client', alias: 'Client' }
    ]
  },
  'AGE REVERSAL TECHNOLOGY CENTER': {
    overrides: [
      { title: 'Onboarding', role: 'Client', alias: 'Client' }
    ]
  }
}

export const runInitialMigrationAndSeed = async (userId) => {
  // Check if clients collection is empty
  const qClients = query(collection(db, 'clients'), limit(1));
  const snap = await getDocs(qClients);
  if (!snap.empty) {
    return false; // Already seeded
  }

  console.log("Running Multi-Client Master Seed...");
  
  // First, let's create the 13 universal template sections. 
  // Wait, if sections are global, we only need to create them ONCE.
  // We will assume sections are global and apply to all clients.
  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'));
  const batch = writeBatch(db);
  
  let globalSections = [];

  if (sectionsSnap.empty) {
    TEMPLATE_SECTIONS.forEach((sec, idx) => {
      const ref = doc(collection(db, 'checklist_sections'));
      batch.set(ref, { 
        nombre: sec.name, 
        area: sec.area, 
        orden: idx + 1, 
        creado_en: new Date().toISOString() 
      });
      globalSections.push({ id: ref.id, nombre: sec.name, area: sec.area });
    });
  } else {
    globalSections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    // If google/ghl sections are missing, we should append them.
    // We already handled this previously, but let's ensure we have everything we need.
  }

  // Create Clients & Tasks
  const clientNames = Object.keys(CLIENT_UPDATES);
  const now = new Date().toISOString();

  clientNames.forEach(clientName => {
    const clientRef = doc(collection(db, 'clients'));
    const clientId = clientRef.id;
    
    // Create Client
    batch.set(clientRef, {
      name: clientName,
      status: 'Active',
      creado_en: now,
      creado_por: userId
    });

    // Determine the overrides
    const overrides = CLIENT_UPDATES[clientName].overrides || [];
    
    // For each client, instantiate the template tasks.
    TEMPLATE_TASKS.forEach(tplTask => {
      const section = globalSections.find(s => s.nombre === tplTask.sectionName);
      if (!section) return; // safety check
      
      const taskRef = doc(collection(db, 'checklist_tasks'));
      
      let finalTitle = tplTask.title;
      let finalRole = tplTask.role;
      let isCompleted = false;
      let isInProgress = false;
      let assignedAlias = null;

      // Check if this task has an override
      const override = overrides.find(o => o.title === tplTask.title);
      if (override) {
        if (override.completed) isCompleted = true;
        if (override.inProgress) {
          isInProgress = true;
          finalTitle = `[In Progress] ${finalTitle}`;
        }
        if (override.alias) assignedAlias = override.alias;
      }

      // If assignedAlias exists, we append it visually for now so they know who has it 
      // since we don't have the exact profile IDs for Jorge/Julius.
      if (assignedAlias && assignedAlias !== 'Client') {
        finalTitle = `${finalTitle} (@${assignedAlias})`;
      }

      batch.set(taskRef, {
        titulo: finalTitle,
        responsable_rol: finalRole,
        seccion_id: section.id,
        client_id: clientId,
        completed: isCompleted,
        prioridad: 'medium',
        responsable_id: null,
        creado_por: userId,
        creado_en: now,
        actualizado_en: now
      });
    });
  });

  await batch.commit();
  console.log("Migration successful!");
  return true;
}

// ─── RESET: delete all template tasks, keep only the user-specified ones ───────
const USER_TASKS = {
  'AGNEW': [
    { titulo: 'Create UGC Videos (new offer)',  sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
  ],
  'BLOOMFIELD': [
    { titulo: 'Waiting for Raw Videos',          sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', responsable_rol: 'Client',      status: 'pending',      completed: false },
  ],
  'GRASS LAKE': [
    { titulo: 'Create UGC Videos (new offer)',  sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
  ],
  'DELTA': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
  ],
  'ECKERT': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
  ],
  'MOORE': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
  ],
  'MESA': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'Funneler',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'in_progress',  completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor', status: 'completed',    completed: true  },
  ],
  'PURE SEOUL': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Client',        status: 'pending',      completed: false },
  ],
  'NAPLES IDEAL FITNESS': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Client',        status: 'pending',      completed: false },
  ],
  'AGE REVERSAL TECHNOLOGY CENTER': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Client',        status: 'pending',      completed: false },
  ],
}

export const runResetToUserTasks = async (userId) => {
  const patchRef = doc(db, 'patches', 'v3_reset_to_user_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  console.log('Running reset: deleting all tasks and re-seeding from user list...')

  const [clientsSnap, sectionsSnap, allTasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients  = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Delete all existing tasks in chunks of 400
  const taskDocs = allTasksSnap.docs
  for (let i = 0; i < taskDocs.length; i += 400) {
    const b = writeBatch(db)
    taskDocs.slice(i, i + 400).forEach(d => b.delete(d.ref))
    await b.commit()
  }

  // Create only the user-specified tasks
  const createBatch = writeBatch(db)
  let count = 0

  for (const client of clients) {
    const taskList = USER_TASKS[client.name]
    if (!taskList) continue

    for (const task of taskList) {
      const section = sections.find(s => s.nombre === task.sectionName)
      if (!section) { console.warn(`Section not found: ${task.sectionName}`); continue }

      const taskRef = doc(collection(db, 'checklist_tasks'))
      createBatch.set(taskRef, {
        titulo: task.titulo,
        responsable_rol: task.responsable_rol,
        seccion_id: section.id,
        client_id: client.id,
        status: task.status,
        completed: task.completed,
        prioridad: 'medium',
        responsable_id: null,
        creado_por: userId,
        creado_en: now,
        actualizado_en: now,
      })
      count++
    }
  }

  createBatch.set(patchRef, { applied_at: now, applied_by: userId, tasks_created: count })
  await createBatch.commit()
  console.log(`Reset complete: ${count} tasks created.`)
}

// ─── PATCH V4: rename clients, add missing clients, seed Google Ads tasks ────

const CLIENT_RENAMES = {
  'AGNEW': 'Agnew Family Wellness',
  'BLOOMFIELD': 'Bloomfield',
  'GRASS LAKE': 'Grass Lake Chiropractic Center',
  'DELTA': 'Delta Chiropractic',
  'ECKERT': 'Eckert Chiropractic, P.C.',
  'MOORE': 'Moore Chiropractic',
  'MESA': 'Mesa Chiropractic Rehab and Wellness',
  'PURE SEOUL': 'Pure Seoul Aesthetics',
  'NAPLES IDEAL FITNESS': 'Ideal Physical Therapy and Fitness',
  'AGE REVERSAL TECHNOLOGY CENTER': 'Age Reversal Technology Center',
}

const NEW_CLIENTS = [
  'Prime Tree Care',
  'All Around Asphalt',
  'Parkway Paving',
  'All Dry Services of North Las Vegas',
  'DNA Honest Plumbing',
  'Pagac & Company, P.C.',
  'Green Z Remodeling',
  'First Choice Chiropractic & Medical Center',
  'Wonders of Chiropractic',
  'The Family Wellness Center',
  'Colorado Pro Health Rehab Kids & Adults',
  'HealthSource Chiropractic of Marlboro',
]

const GOOGLE_ADS_TASKS = [
  { title: 'Adv. Verification', role: 'Media Buyer' },
  { title: 'Connect SiteKit (Google Tag)', role: 'Funneler' },
  { title: 'Google Tag Installation', role: 'Funneler' },
  { title: 'Install GHL # Script', role: 'Funneler' },
  { title: 'Map GHL Conv. > Google Ads', role: 'Media Buyer' },
  { title: 'Create Conv. Actions', role: 'Media Buyer' },
  { title: 'Create Campaigns', role: 'Media Buyer' },
  { title: 'Connect GMB', role: 'Media Buyer' },
  { title: 'Create Assets', role: 'Graphic Designer' },
  { title: 'Launch Campaigns', role: 'Media Buyer' },
]

export const runPatchV4 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v4_clients_rename_and_google_ads')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  console.log('Running patch v4: rename clients, add new clients, seed Google Ads...')

  const [clientsSnap, sectionsSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  let sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()
  let count = 0

  // --- a) Rename existing clients ---
  const renameBatch = writeBatch(db)
  for (const client of clients) {
    const newName = CLIENT_RENAMES[client.name]
    if (newName && newName !== client.name) {
      renameBatch.update(doc(db, 'clients', client.id), { name: newName })
      count++
    }
  }
  await renameBatch.commit()
  console.log(`Renamed ${count} clients.`)

  // --- b) Ensure "Google Ads" section exists ---
  let googleAdsSection = sections.find(s => s.nombre === 'Google Ads')
  if (!googleAdsSection) {
    const maxOrden = Math.max(...sections.map(s => s.orden || 0), 0)
    const secRef = doc(collection(db, 'checklist_sections'))
    await setDoc(secRef, {
      nombre: 'Google Ads',
      area: 'google_ads',
      orden: maxOrden + 1,
      creado_en: now,
    })
    googleAdsSection = { id: secRef.id, nombre: 'Google Ads', area: 'google_ads' }
    sections = [...sections, googleAdsSection]
    console.log('Created "Google Ads" section.')
  }

  // --- c) Create new clients with template tasks + Google Ads ---
  const existingNames = new Set(clients.map(c => c.name))
  // Also check renamed names
  Object.values(CLIENT_RENAMES).forEach(n => existingNames.add(n))

  const newClientIds = []

  for (let i = 0; i < NEW_CLIENTS.length; i += 4) {
    const chunk = NEW_CLIENTS.slice(i, i + 4)
    const batch = writeBatch(db)

    for (const name of chunk) {
      if (existingNames.has(name)) continue

      const clientRef = doc(collection(db, 'clients'))
      batch.set(clientRef, { name, status: 'Active', creado_en: now, creado_por: userId })
      newClientIds.push(clientRef.id)

      // Seed template tasks (meta_ads)
      for (const tpl of TEMPLATE_TASKS) {
        const sec = sections.find(s => s.nombre === tpl.sectionName)
        if (!sec) continue
        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: tpl.title,
          responsable_rol: tpl.role,
          seccion_id: sec.id,
          client_id: clientRef.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
      }
    }

    await batch.commit()
  }
  console.log(`Created ${newClientIds.length} new clients with template tasks.`)

  // --- d) Seed Google Ads tasks for ALL existing clients ---
  // Re-fetch clients to include newly created ones
  const allClientsSnap = await getDocs(collection(db, 'clients'))
  const allClients = allClientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Check which clients already have Google Ads tasks
  const existingTasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const existingGATasks = new Set()
  for (const d of existingTasksSnap.docs) {
    const data = d.data()
    if (data.seccion_id === googleAdsSection.id) {
      existingGATasks.add(`${data.client_id}|${data.titulo}`)
    }
  }

  let gaCount = 0
  for (let i = 0; i < allClients.length; i += 3) {
    const chunk = allClients.slice(i, i + 3)
    const batch = writeBatch(db)

    for (const client of chunk) {
      for (const ga of GOOGLE_ADS_TASKS) {
        const key = `${client.id}|${ga.title}`
        if (existingGATasks.has(key)) continue

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: ga.title,
          responsable_rol: ga.role,
          seccion_id: googleAdsSection.id,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        gaCount++
      }
    }

    await batch.commit()
  }

  // Mark patch as applied
  await setDoc(patchRef, { applied_at: now, applied_by: userId, clients_renamed: count, clients_created: newClientIds.length, google_ads_tasks: gaCount })
  console.log(`Patch v4 done: ${gaCount} Google Ads tasks created.`)
}

// ─── PATCH V5: redistribute Google Ads tasks into 3 sections ────────────────

const GA_TASK_TO_SECTION = {
  'Adv. Verification': '1. GOOGLE ADS SETUP',
  'Connect SiteKit (Google Tag)': '1. GOOGLE ADS SETUP',
  'Google Tag Installation': '1. GOOGLE ADS SETUP',
  'Install GHL # Script': '1. GOOGLE ADS SETUP',
  'Connect GMB': '1. GOOGLE ADS SETUP',
  'Create Campaigns': '2. SEARCH CAMPAIGNS',
  'Create Assets': '2. SEARCH CAMPAIGNS',
  'Launch Campaigns': '2. SEARCH CAMPAIGNS',
  'Map GHL Conv. > Google Ads': '3. TRACKING & CONVERSIONS',
  'Create Conv. Actions': '3. TRACKING & CONVERSIONS',
}

export const runPatchV5 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v5_redistribute_google_ads')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  console.log('Running patch v5: redistribute Google Ads tasks...')

  const [sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const googleAdsSection = sections.find(s => s.nombre === 'Google Ads')
  if (!googleAdsSection) {
    console.log('No "Google Ads" section found, skipping.')
    await setDoc(patchRef, { applied_at: new Date().toISOString(), applied_by: userId, skipped: true })
    return
  }

  const now = new Date().toISOString()
  let count = 0

  // Move tasks from "Google Ads" to the proper section
  const tasksToMove = tasksSnap.docs.filter(d => d.data().seccion_id === googleAdsSection.id)

  for (let i = 0; i < tasksToMove.length; i += 400) {
    const batch = writeBatch(db)
    for (const taskDoc of tasksToMove.slice(i, i + 400)) {
      const data = taskDoc.data()
      const targetSectionName = GA_TASK_TO_SECTION[data.titulo]
      if (!targetSectionName) continue
      const targetSection = sections.find(s => s.nombre === targetSectionName)
      if (!targetSection) continue
      batch.update(taskDoc.ref, { seccion_id: targetSection.id, actualizado_en: now })
      count++
    }
    await batch.commit()
  }

  // Delete the now-empty "Google Ads" section
  await deleteDoc(doc(db, 'checklist_sections', googleAdsSection.id))

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_moved: count })
  console.log(`Patch v5 done: ${count} tasks redistributed, "Google Ads" section deleted.`)
}

export const createNewClientWithTemplate = async (clientName, userId, globalSections) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  const clientRef = doc(collection(db, 'clients'));
  const clientId = clientRef.id;
  
  batch.set(clientRef, {
    name: clientName,
    status: 'Active',
    creado_en: now,
    creado_por: userId
  });

  TEMPLATE_TASKS.forEach(tplTask => {
    const section = globalSections.find(s => s.nombre === tplTask.sectionName);
    if (!section) return; 
    
    const taskRef = doc(collection(db, 'checklist_tasks'));
    
    batch.set(taskRef, {
      titulo: tplTask.title,
      responsable_rol: tplTask.role,
      seccion_id: section.id,
      client_id: clientId,
      completed: false,
      prioridad: 'medium',
      responsable_id: null,
      creado_por: userId,
      creado_en: now,
      actualizado_en: now
    });
  });

  await batch.commit();
  return { id: clientId, name: clientName };
}
