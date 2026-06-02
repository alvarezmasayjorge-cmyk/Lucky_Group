import { db } from './firebase'
import { collection, doc, writeBatch, getDocs, query, limit, setDoc, getDoc } from 'firebase/firestore'
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
