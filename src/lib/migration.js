import { db } from './firebase'
import { collection, doc, writeBatch, getDocs, query, limit, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { TEMPLATE_SECTIONS, TEMPLATE_TASKS } from './templateTasks'

// Tasks to patch into existing clients (added after initial seeding)
const PATCH_V1 = {
  'AGNEW': [
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
  ],
  'BLOOMFIELD': [
    { titulo: 'Waiting for Raw Videos', sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', responsable_rol: 'Project Manager', completed: false },
  ],
  'GRASS LAKE': [
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
  ],
  'DELTA': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
  ],
  'ECKERT': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
  ],
  'MOORE': [
    { titulo: 'Create New Landing Page (@Julius)',       sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',              sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Create Doctor Video — Long (@Jorge)',     sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Doctor Video — Short (@Jorge)',    sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)', sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
  ],
  'MESA': [
    { titulo: 'Create New Landing Page (@Julius)',              sectionName: '4. LANDING PAGE',      responsable_rol: 'GoHighLevel Specialist',      completed: false },
    { titulo: 'Set Up New Pixel (@Julius)',                     sectionName: '3. PIXEL & TRACKING',  responsable_rol: 'GoHighLevel Specialist',      completed: false },
    {
      titulo: '[In Progress] Create Doctor Video — Long (@Jorge)',
      renameFrom: 'Create Doctor Video — Long (@Jorge)',
      sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false,
    },
    { titulo: 'Create Doctor Video — Short (@Jorge)',           sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: false },
    { titulo: 'Create Short Videos (new offer) (@Jorge)',       sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
    { titulo: 'Create UGC Videos (new offer) (@Jorge)',         sectionName: '6. VIDEO AD CREATION', responsable_rol: 'Video Editor/Meta Specialist', completed: true  },
  ],
  'PURE SEOUL': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Project Manager', completed: false },
  ],
  'NAPLES IDEAL FITNESS': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Project Manager', completed: false },
  ],
  'AGE REVERSAL TECHNOLOGY CENTER': [
    { titulo: 'Onboarding', sectionName: '1. ACCESS & ONBOARDING', responsable_rol: 'Project Manager', completed: false },
  ],
}

export const runPatchV1 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v1_missing_tasks_r2')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return // already applied


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
      if (!section) { continue }

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
}

const CLIENT_UPDATES = {
  'AGNEW': {
    overrides: [
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' }
    ]
  },
  'BLOOMFIELD': {
    overrides: [
      { title: 'Waiting for Raw Videos', role: 'Project Manager', alias: null }
    ]
  },
  'GRASS LAKE': {
    overrides: [
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' }
    ]
  },
  'DELTA': {
    overrides: [
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true }
    ]
  },
  'ECKERT': {
    overrides: [
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true }
    ]
  },
  'MOORE': {
    overrides: [
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true }
    ]
  },
  'MESA': {
    overrides: [
      { title: 'Create New Landing Page', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Set Up New Pixel', role: 'GoHighLevel Specialist', alias: 'Julius' },
      { title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist', alias: 'Jorge', inProgress: true },
      { title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist', alias: 'Jorge' },
      { title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true },
      { title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist', alias: 'Jorge', completed: true }
    ]
  },
  'PURE SEOUL': {
    overrides: [
      { title: 'Onboarding', role: 'Project Manager', alias: null }
    ]
  },
  'NAPLES IDEAL FITNESS': {
    overrides: [
      { title: 'Onboarding', role: 'Project Manager', alias: null }
    ]
  },
  'AGE REVERSAL TECHNOLOGY CENTER': {
    overrides: [
      { title: 'Onboarding', role: 'Project Manager', alias: null }
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
  return true;
}

// ─── RESET: delete all template tasks, keep only the user-specified ones ───────
const USER_TASKS = {
  'AGNEW': [
    { titulo: 'Create UGC Videos (new offer)',  sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
  ],
  'BLOOMFIELD': [
    { titulo: 'Waiting for Raw Videos',          sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', responsable_rol: 'Project Manager',      status: 'pending',      completed: false },
  ],
  'GRASS LAKE': [
    { titulo: 'Create UGC Videos (new offer)',  sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
  ],
  'DELTA': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
  ],
  'ECKERT': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
  ],
  'MOORE': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
  ],
  'MESA': [
    { titulo: 'Create New Landing Page',         sectionName: '4. LANDING PAGE',                           responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Set Up New Pixel',                sectionName: '3. PIXEL & TRACKING',                       responsable_rol: 'GoHighLevel Specialist',      status: 'pending',      completed: false },
    { titulo: 'Create Doctor Video — Long',      sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'in_progress',  completed: false },
    { titulo: 'Create Doctor Video — Short',     sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'pending',      completed: false },
    { titulo: 'Create Short Videos (new offer)', sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
    { titulo: 'Create UGC Videos (new offer)',   sectionName: '6. VIDEO AD CREATION',                      responsable_rol: 'Video Editor/Meta Specialist', status: 'completed',    completed: true  },
  ],
  'PURE SEOUL': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Project Manager',        status: 'pending',      completed: false },
  ],
  'NAPLES IDEAL FITNESS': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Project Manager',        status: 'pending',      completed: false },
  ],
  'AGE REVERSAL TECHNOLOGY CENTER': [
    { titulo: 'Onboarding',                      sectionName: '1. ACCESS & ONBOARDING',                    responsable_rol: 'Project Manager',        status: 'pending',      completed: false },
  ],
}

export const runResetToUserTasks = async (userId) => {
  const patchRef = doc(db, 'patches', 'v3_reset_to_user_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return


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
      if (!section) { continue }

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
  { title: 'Adv. Verification', role: 'Video Editor/Meta Specialist' },
  { title: 'Connect SiteKit (Google Tag)', role: 'GoHighLevel Specialist' },
  { title: 'Google Tag Installation', role: 'GoHighLevel Specialist' },
  { title: 'Install GHL # Script', role: 'GoHighLevel Specialist' },
  { title: 'Map GHL Conv. > Google Ads', role: 'Video Editor/Meta Specialist' },
  { title: 'Create Conv. Actions', role: 'Video Editor/Meta Specialist' },
  { title: 'Create Campaigns', role: 'Video Editor/Meta Specialist' },
  { title: 'Connect GMB', role: 'Video Editor/Meta Specialist' },
  { title: 'Create Assets', role: 'Video Editor/Meta Specialist' },
  { title: 'Launch Campaigns', role: 'Video Editor/Meta Specialist' },
]

export const runPatchV4 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v4_clients_rename_and_google_ads')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return


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


  const [sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const googleAdsSection = sections.find(s => s.nombre === 'Google Ads')
  if (!googleAdsSection) {
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
}

// ─── PATCH V6: reseed template tasks for new clients that lost theirs ─────────
// Fixes data corruption caused by v3 and v4 running in parallel via Promise.all.
// v3 deleted ALL tasks while v4 was simultaneously creating new-client tasks,
// leaving NEW_CLIENTS with 0 (or partial) tasks.

export const runPatchV6 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v6_reseed_new_client_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Build set of existing "clientId|sectionName|titulo" to detect duplicates
  const sectionById = Object.fromEntries(sections.map(s => [s.id, s]))
  const existingKeys = new Set()
  for (const d of tasksSnap.docs) {
    const t = d.data()
    const sec = sectionById[t.seccion_id]
    if (sec) existingKeys.add(`${t.client_id}|${sec.nombre}|${t.titulo}`)
  }

  let count = 0

  for (let i = 0; i < clients.length; i += 4) {
    const chunk = clients.slice(i, i + 4)
    const batch = writeBatch(db)

    for (const client of chunk) {
      // Only reseed NEW_CLIENTS — old clients intentionally have limited tasks
      if (!NEW_CLIENTS.includes(client.name)) continue

      for (const tpl of TEMPLATE_TASKS) {
        const sec = sections.find(s => s.nombre === tpl.sectionName)
        if (!sec) continue
        const key = `${client.id}|${tpl.sectionName}|${tpl.title}`
        if (existingKeys.has(key)) continue

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: tpl.title,
          responsable_rol: tpl.role,
          seccion_id: sec.id,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        count++
      }
    }

    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_added: count })
}

// ─── PATCH V7: seed all TEMPLATE_TASKS for every client ──────────────────────
// Ensures every client (old and new) has the standard tasks for Meta Ads,
// Google Ads, and GHL. Skips tasks that already exist (by title + section).

export const runPatchV7 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v7_seed_all_clients_full_template')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Build duplicate-check set: "clientId|sectionId|titulo"
  const existingKeys = new Set(
    tasksSnap.docs.map(d => {
      const t = d.data()
      return `${t.client_id}|${t.seccion_id}|${t.titulo}`
    })
  )

  let count = 0

  for (let i = 0; i < clients.length; i += 4) {
    const chunk = clients.slice(i, i + 4)
    const batch = writeBatch(db)

    for (const client of chunk) {
      for (const tpl of TEMPLATE_TASKS) {
        const sec = sections.find(s => s.nombre === tpl.sectionName)
        if (!sec) continue
        const key = `${client.id}|${sec.id}|${tpl.title}`
        if (existingKeys.has(key)) continue

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: tpl.title,
          responsable_rol: tpl.role,
          seccion_id: sec.id,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        count++
      }
    }

    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_added: count })
}

// ─── PATCH V8: seed GHL tasks for all clients ────────────────────────────────

export const runPatchV8 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v8_ghl_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  let sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Ensure "4. AI RECEPTIONIST" section exists
  let aiRecepSection = sections.find(s => s.nombre === '4. AI RECEPTIONIST')
  if (!aiRecepSection) {
    const maxOrden = Math.max(...sections.filter(s => s.area === 'ghl').map(s => s.orden || 0), 0)
    const secRef = doc(collection(db, 'checklist_sections'))
    await setDoc(secRef, {
      nombre: '4. AI RECEPTIONIST',
      area: 'ghl',
      orden: maxOrden + 1,
      creado_en: now,
    })
    aiRecepSection = { id: secRef.id, nombre: '4. AI RECEPTIONIST', area: 'ghl' }
    sections = [...sections, aiRecepSection]
  }

  // Build dedup set: clientId|sectionId|titulo
  const existingKeys = new Set(
    tasksSnap.docs.map(d => {
      const t = d.data()
      return `${t.client_id}|${t.seccion_id}|${t.titulo}`
    })
  )

  let count = 0

  for (let i = 0; i < clients.length; i += 4) {
    const chunk = clients.slice(i, i + 4)
    const batch = writeBatch(db)

    for (const client of chunk) {
      for (const tpl of TEMPLATE_TASKS) {
        const sec = sections.find(s => s.nombre === tpl.sectionName)
        if (!sec || sec.area !== 'ghl') continue
        const key = `${client.id}|${sec.id}|${tpl.title}`
        if (existingKeys.has(key)) continue

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: tpl.title,
          responsable_rol: tpl.role,
          seccion_id: sec.id,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        count++
      }
    }

    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_added: count })
}

// ─── PATCH V9: add platform_budgets map to all clients ───────────────────────
export const runPatchV9 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v9_platform_budgets')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const clientsSnap = await getDocs(collection(db, 'clients'))
  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()
  const emptyPlatformBudgets = {
    lsa:             { allocated: 0, spent: 0 },
    google_ads:      { allocated: 0, spent: 0 },
    facebook_ads:    { allocated: 0, spent: 0 },
    ai_receptionist: { allocated: 0, spent: 0 },
    seo:             { allocated: 0, spent: 0 },
    website_built:   { allocated: 0, spent: 0 },
  }
  let count = 0
  for (let i = 0; i < clients.length; i += 400) {
    const batch = writeBatch(db)
    for (const client of clients.slice(i, i + 400)) {
      if (client.platform_budgets) continue
      batch.update(doc(db, 'clients', client.id), { platform_budgets: emptyPlatformBudgets })
      count++
    }
    await batch.commit()
  }
  await setDoc(patchRef, { applied_at: now, applied_by: userId, clients_updated: count })
}

// ─── PATCH V10: migrate old role names to new roles ──────────────────────────
export const runPatchV10 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v10_role_migration')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const ROLE_MAP = {
    'Client':          'Project Manager',
    'Media Buyer':     'Video Editor/Meta Specialist',
    'Funneler':        'GoHighLevel Specialist',
    'Video Editor':    'Video Editor/Meta Specialist',
    'Graphic Designer':'Video Editor/Meta Specialist',
  }

  const [tasksSnap, profilesSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_tasks')),
    getDocs(collection(db, 'profiles')),
  ])
  const now = new Date().toISOString()
  let count = 0

  const taskDocs = tasksSnap.docs.filter(d => ROLE_MAP[d.data().responsable_rol])
  for (let i = 0; i < taskDocs.length; i += 400) {
    const batch = writeBatch(db)
    for (const d of taskDocs.slice(i, i + 400)) {
      batch.update(d.ref, { responsable_rol: ROLE_MAP[d.data().responsable_rol], actualizado_en: now })
      count++
    }
    await batch.commit()
  }

  const profileDocs = profilesSnap.docs.filter(d => ROLE_MAP[d.data().rol_equipo])
  for (let i = 0; i < profileDocs.length; i += 400) {
    const batch = writeBatch(db)
    for (const d of profileDocs.slice(i, i + 400)) {
      batch.update(d.ref, { rol_equipo: ROLE_MAP[d.data().rol_equipo] })
      count++
    }
    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, docs_updated: count })
}

// ─── PATCH V11: add services map to all clients ───────────────────────────────
export const runPatchV11 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v11_services')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const clientsSnap = await getDocs(collection(db, 'clients'))
  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()
  const emptyServices = {
    lsa: false, google_ads: false, facebook_ads: false,
    ai_receptionist: false, seo: false, website_built: false,
  }
  let count = 0
  for (let i = 0; i < clients.length; i += 400) {
    const batch = writeBatch(db)
    for (const client of clients.slice(i, i + 400)) {
      if (client.services) continue
      batch.update(doc(db, 'clients', client.id), { services: emptyServices })
      count++
    }
    await batch.commit()
  }
  await setDoc(patchRef, { applied_at: now, applied_by: userId, clients_updated: count })
}

// ─── PATCH V12: realign all tasks with Project Tracker Sheet ─────────────────
// Deletes old sections & tasks (except Video Ad Creation / Image Ad Creation),
// creates new sections from the updated TEMPLATE_SECTIONS, and seeds tasks
// per client with correct completion status from the Project Tracker spreadsheet.

export const runPatchV12 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v12_realign_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // ─ Identify sections to PRESERVE (Video Ad Creation / Image Ad Creation) ─
  const PRESERVE_SECTIONS = new Set()
  for (const s of sections) {
    if (s.nombre === '6. VIDEO AD CREATION' || s.nombre === '7. IMAGE AD CREATION') {
      PRESERVE_SECTIONS.add(s.id)
    }
  }

  // ─ Delete all tasks NOT in preserved sections ─
  const tasksToDelete = tasksSnap.docs.filter(d => !PRESERVE_SECTIONS.has(d.data().seccion_id))
  for (let i = 0; i < tasksToDelete.length; i += 400) {
    const batch = writeBatch(db)
    tasksToDelete.slice(i, i + 400).forEach(d => batch.delete(d.ref))
    await batch.commit()
  }

  // ─ Delete all sections NOT preserved ─
  const sectionsToDelete = sections.filter(s => !PRESERVE_SECTIONS.has(s.id))
  for (let i = 0; i < sectionsToDelete.length; i += 400) {
    const batch = writeBatch(db)
    sectionsToDelete.slice(i, i + 400).forEach(s => batch.delete(doc(db, 'checklist_sections', s.id)))
    await batch.commit()
  }

  // ─ Create new sections ─
  const NEW_SECTIONS = [
    { nombre: 'Onboarding Process', area: 'meta_ads', orden: 1 },
    { nombre: 'Facebook Ads Setup', area: 'meta_ads', orden: 2 },
    { nombre: 'Meta Business Setup', area: 'meta_ads', orden: 3 },
    { nombre: 'Pixel and Tracking', area: 'meta_ads', orden: 4 },
    { nombre: 'Video Ad Materials', area: 'meta_ads', orden: 5 },
    { nombre: 'Video Ad Creation', area: 'meta_ads', orden: 6 },
    { nombre: 'Google Ads', area: 'google_ads', orden: 7 },
    { nombre: 'Website SEO/AEO Set Up', area: 'seo', orden: 8 },
    { nombre: 'Funnels', area: 'ghl', orden: 9 },
    { nombre: 'AI Receptionist', area: 'ghl', orden: 10 },
  ]

  const sectionMap = {} // nombre → id
  const secBatch = writeBatch(db)
  for (const s of NEW_SECTIONS) {
    const ref = doc(collection(db, 'checklist_sections'))
    secBatch.set(ref, { ...s, creado_en: now })
    sectionMap[s.nombre] = ref.id
  }
  await secBatch.commit()

  // ─ Task definitions with default completion ─
  // d: true = completed for most clients, false = pending for most
  const TASKS = [
    // Onboarding Process
    { s: 'Onboarding Process', t: 'Onboarding Form | GHL Creation & Access | AI Marketing Content Requirements emails', r: 'Project Manager', d: true },
    { s: 'Onboarding Process', t: 'Onboarding call', r: 'Project Manager', d: false },
    { s: 'Onboarding Process', t: 'Website Access', r: 'Project Manager', d: true },
    { s: 'Onboarding Process', t: 'Domain Access', r: 'Project Manager', d: true },
    { s: 'Onboarding Process', t: 'Offer Details', r: 'Project Manager', d: true },
    { s: 'Onboarding Process', t: 'A2P Registration', r: 'Project Manager', d: true },
    // Facebook Ads Setup
    { s: 'Facebook Ads Setup', t: 'Meta access (Business Manager, Ad Account, Page, IG)', r: 'Project Manager', d: true },
    { s: 'Facebook Ads Setup', t: 'Website access (pixel + domain verification)', r: 'Project Manager', d: true },
    { s: 'Facebook Ads Setup', t: 'Brand kit (logo, colors, fonts)', r: 'Project Manager', d: false },
    { s: 'Facebook Ads Setup', t: 'Target audience info', r: 'Project Manager', d: false },
    { s: 'Facebook Ads Setup', t: 'Budget & campaign goals', r: 'Project Manager', d: true },
    // Meta Business Setup
    { s: 'Meta Business Setup', t: 'Domain verification (Meta Business Manager)', r: 'Video Editor/Meta Specialist', d: false },
    { s: 'Meta Business Setup', t: 'Ad account setup (create/connect + payments)', r: 'Video Editor/Meta Specialist', d: false },
    { s: 'Meta Business Setup', t: 'Connect Facebook Page & Instagram', r: 'Video Editor/Meta Specialist', d: false },
    { s: 'Meta Business Setup', t: 'Assign team roles & permissions', r: 'Video Editor/Meta Specialist', d: true },
    // Pixel and Tracking
    { s: 'Pixel and Tracking', t: 'Create Facebook Pixel', r: 'Video Editor/Meta Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Install pixel on website (header code or via GTM)', r: 'GoHighLevel Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Set up standard events (PageView, Lead, Purchase, complete registration)', r: 'GoHighLevel Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Verify Pixel is firing correctly (Meta Pixel Helper)', r: 'GoHighLevel Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Set up conversions API (server side tracking)', r: 'GoHighLevel Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Define & configure UTM parameters for all URLs', r: 'Video Editor/Meta Specialist', d: true },
    { s: 'Pixel and Tracking', t: 'Test all events in Meta Events Manager', r: 'Video Editor/Meta Specialist', d: true },
    // Video Ad Materials
    { s: 'Video Ad Materials', t: 'Raw photo and video files', r: 'Project Manager', d: true },
    { s: 'Video Ad Materials', t: 'Voice Recording', r: 'Project Manager', d: true },
    { s: 'Video Ad Materials', t: 'Multi-angle portrait photos of the client', r: 'Project Manager', d: true },
    // Video Ad Creation (only for clients that don't have old 6./7. sections)
    { s: 'Video Ad Creation', t: 'Video Edits - Long Versions', r: 'Video Editor/Meta Specialist', d: true },
    { s: 'Video Ad Creation', t: 'Video Edits - Short Versions', r: 'Video Editor/Meta Specialist', d: false },
    { s: 'Video Ad Creation', t: 'Image ads creation', r: 'Video Editor/Meta Specialist', d: true },
    // Google Ads
    { s: 'Google Ads', t: 'Adv. Verification', r: 'Project Manager', d: true },
    { s: 'Google Ads', t: 'Connect Search Console to Google Ads', r: 'Project Manager', d: false },
    { s: 'Google Ads', t: 'Connect SiteKit (Google Tag)', r: 'GoHighLevel Specialist', d: false },
    { s: 'Google Ads', t: 'Google Tag Installation', r: 'Project Manager', d: false },
    { s: 'Google Ads', t: 'Install GHL # Script', r: 'GoHighLevel Specialist', d: true },
    { s: 'Google Ads', t: 'Map GHL Conv. > Google Ads', r: 'GoHighLevel Specialist', d: true },
    { s: 'Google Ads', t: 'Create Conv. Actions', r: 'Google Specialist', d: true },
    { s: 'Google Ads', t: 'Create Campaigns', r: 'Google Specialist', d: true },
    { s: 'Google Ads', t: 'Connect GMB to Google ads', r: 'Project Manager', d: true },
    { s: 'Google Ads', t: 'Create Assets', r: 'Google Specialist', d: true },
    { s: 'Google Ads', t: 'GA4 Connection (add Jens and LCG as Admins)', r: 'Project Manager', d: false },
    { s: 'Google Ads', t: 'GSC Connection (add Jens and LCG as Admins)', r: 'Project Manager', d: false },
    { s: 'Google Ads', t: 'Get LSA Approved', r: 'Project Manager', d: false },
    { s: 'Google Ads', t: 'Launch Campaigns', r: 'Google Specialist', d: true },
    { s: 'Google Ads', t: 'Launch Campaigns (LSA)', r: 'Project Manager', d: false },
    // Website SEO/AEO Set Up
    { s: 'Website SEO/AEO Set Up', t: 'Add luckyconsultinggroup@gmail.com & Jens as manager for GBP', r: 'Project Manager', d: false },
    { s: 'Website SEO/AEO Set Up', t: 'Geoscribe connection to WP site', r: 'Project Manager', d: false },
    { s: 'Website SEO/AEO Set Up', t: 'set up GBP automation', r: 'GoHighLevel Specialist', d: false },
    { s: 'Website SEO/AEO Set Up', t: 'set up SEO/AEO automation', r: 'GoHighLevel Specialist', d: false },
    { s: 'Website SEO/AEO Set Up', t: "Create WP site if client doesn't have one", r: 'Project Manager', d: false },
  ]

  // ─ Per-client overrides (exceptions to the default `d` value above) ─
  // Only list clients whose status DIFFERS from the default
  const OVERRIDES = {
    'Bloomfield Construction & Restoration': {
      'Onboarding call': true,
      'Brand kit (logo, colors, fonts)': true,
      'Target audience info': true,
      'Domain verification (Meta Business Manager)': true,
      'Assign team roles & permissions': true,
      'Geoscribe connection to WP site': true,
    },
    'Prime Tree Care': {
      'Onboarding call': true,
      'Brand kit (logo, colors, fonts)': true,
      'Target audience info': true,
      'Domain verification (Meta Business Manager)': true,
    },
    'Age Reversal Technology Center': {
      'Launch Campaigns (LSA)': true,
    },
  }

  // ─ Determine which clients already have preserved Video Ad sections ─
  const clientsWithOldVideoTasks = new Set()
  for (const d of tasksSnap.docs) {
    if (PRESERVE_SECTIONS.has(d.data().seccion_id)) {
      clientsWithOldVideoTasks.add(d.data().client_id)
    }
  }

  // ─ Create tasks for each client ─
  let totalCreated = 0
  for (let ci = 0; ci < clients.length; ci += 2) {
    const chunk = clients.slice(ci, ci + 2)
    const batch = writeBatch(db)

    for (const client of chunk) {
      const overrides = OVERRIDES[client.name] || {}

      for (const task of TASKS) {
        // Skip Video Ad Creation tasks for clients that still have old sections
        if (task.s === 'Video Ad Creation' && clientsWithOldVideoTasks.has(client.id)) continue

        const secId = sectionMap[task.s]
        if (!secId) continue

        const isCompleted = overrides[task.t] !== undefined ? overrides[task.t] : task.d

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: task.t,
          responsable_rol: task.r,
          seccion_id: secId,
          client_id: client.id,
          status: isCompleted ? 'completed' : 'pending',
          completed: isCompleted,
          prioridad: 'low',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        totalCreated++
      }
    }

    await batch.commit()
  }

  await setDoc(patchRef, {
    applied_at: now,
    applied_by: userId,
    sections_deleted: sectionsToDelete.length,
    tasks_deleted: tasksToDelete.length,
    sections_created: NEW_SECTIONS.length,
    tasks_created: totalCreated,
  })
}

// ─── PATCH V13: set client services + create Main Street Chiropractic ────────
export const runPatchV13 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v13_client_services')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const now = new Date().toISOString()

  // Services data from the Project Tracker image
  // Order: lsa, google_ads, facebook_ads, ai_receptionist, seo, website_built
  const SVC = {
    'Bloomfield Construction & Restoration': [1,1,1,1,1,0],
    'Prime Tree Care':                       [1,1,1,0,1,0],
    'All Around Asphalt':                    [0,0,0,0,0,0],
    'Parkway Paving':                        [1,1,1,0,1,0],
    'All Dry Services of North Las Vegas':   [0,0,0,0,1,0],
    'DNA Honest Plumbing':                   [1,1,1,0,1,0],
    'Pagac & Company, P.C.':                 [1,1,1,0,0,0],
    'Agnew Family Wellness':                 [1,1,1,1,1,0],
    'Grass Lake Chiropractic Center':        [0,0,1,0,0,0],
    'Delta Chiropractic':                    [0,1,1,0,0,0],
    'Eckert Chiropractic, P.C.':             [0,0,1,1,0,0],
    'Green Z Remodeling':                    [0,0,0,0,0,0],
    'First Choice Chiropractic & Medical Center': [0,0,0,1,0,0],
    'Mesa Chiropractic Rehab and Wellness':  [1,1,1,1,0,1],
    'Moore Chiropractic':                    [1,1,1,0,1,0],
    'Wonders of Chiropractic':               [1,1,1,0,1,0],
    'The Family Wellness Center':            [1,1,1,0,0,0],
    'Colorado Pro Health Rehab Kids & Adults': [1,0,0,1,0,0],
    'HealthSource Chiropractic of Marlboro': [1,1,0,1,0,0],
    'Ideal Physical Therapy and Fitness':    [1,1,1,0,1,1],
    'Pure Seoul Aesthetics':                 [1,1,1,0,1,1],
    'Age Reversal Technology Center':        [0,1,0,1,0,0],
    'Main Street Chiropractic':              [0,1,0,0,0,0],
  }

  const keys = ['lsa','google_ads','facebook_ads','ai_receptionist','seo','website_built']

  const clientsSnap = await getDocs(collection(db, 'clients'))
  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const existingNames = new Set(clients.map(c => c.name))

  // Create Main Street Chiropractic if missing
  if (!existingNames.has('Main Street Chiropractic')) {
    const clientRef = doc(collection(db, 'clients'))
    await setDoc(clientRef, {
      name: 'Main Street Chiropractic',
      status: 'Active',
      creado_en: now,
      creado_por: userId,
      platform_budgets: { lsa:{allocated:0,spent:0}, google_ads:{allocated:0,spent:0}, facebook_ads:{allocated:0,spent:0}, ai_receptionist:{allocated:0,spent:0}, seo:{allocated:0,spent:0}, website_built:{allocated:0,spent:0} },
      budget_allocated: 0, budget_spent: 0, budget_currency: 'USD',
      services: { lsa:false, google_ads:true, facebook_ads:false, ai_receptionist:false, seo:false, website_built:false },
    })
    // Seed template tasks for new client
    const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
    const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const batch = writeBatch(db)
    for (const tpl of TEMPLATE_TASKS) {
      const sec = sections.find(s => s.nombre === tpl.sectionName)
      if (!sec) continue
      const taskRef = doc(collection(db, 'checklist_tasks'))
      batch.set(taskRef, {
        titulo: tpl.title, responsable_rol: tpl.role, seccion_id: sec.id,
        client_id: clientRef.id, status: 'pending', completed: false,
        prioridad: 'low', responsable_id: null, creado_por: userId,
        creado_en: now, actualizado_en: now,
      })
    }
    await batch.commit()
  }

  // Re-fetch all clients (including newly created)
  const allClientsSnap = await getDocs(collection(db, 'clients'))
  const allClients = allClientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  let count = 0
  for (let i = 0; i < allClients.length; i += 400) {
    const batch = writeBatch(db)
    for (const client of allClients.slice(i, i + 400)) {
      const arr = SVC[client.name]
      if (!arr) continue
      const services = {}
      keys.forEach((k, idx) => { services[k] = !!arr[idx] })
      batch.update(doc(db, 'clients', client.id), { services, actualizado_en: now })
      count++
    }
    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, clients_updated: count })
}

// ─── PATCH V14: add GHL funnel + AI receptionist tasks ──────────────────────
export const runPatchV14 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v14_ghl_tasks_from_julius')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Tasks to add (from Julius tasks file)
  const NEW_TASKS = [
    // Funnels section tasks
    { s: 'Funnels', t: 'Build funnel according to strategy', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Client Assets', r: 'Project Manager' },
    { s: 'Funnels', t: 'Purchase Lookalike Domain', r: 'Project Manager' },
    { s: 'Funnels', t: 'Client Offer', r: 'Project Manager' },
    { s: 'Funnels', t: 'Tracking code installation', r: 'GoHighLevel Specialist' },
    // Workflow Automation
    { s: 'Funnels', t: 'CAPI Conversion', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Google Number Pool Conversion', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'New Lead Optin - Did not schedule', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Booked Appointment Reminder', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'No Show/Cancelled Appointment Win-back', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Pipeline Changed To No Show/Cancelled', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Lead to AI Outbound Call', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Get and Place Call: Outbound + Inbound', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Reactivation Call: Stale Customer', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Lead Type Updater & Aging', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Inbound Message Internal Notification', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Missed Call Text Back', r: 'GoHighLevel Specialist' },
    // Tracking/Setup
    { s: 'Funnels', t: 'Integration', r: 'Project Manager' },
    { s: 'Funnels', t: 'Integration (Meta)', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Integrate Domain', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'Set and Validate Dedicated Sending Domain', r: 'GoHighLevel Specialist' },
    { s: 'Funnels', t: 'A2P Application', r: 'Project Manager' },
    { s: 'Funnels', t: 'Google Lead Event Creation', r: 'Google Specialist' },
    // AI Receptionist
    { s: 'AI Receptionist', t: 'Prompt', r: 'GoHighLevel Specialist' },
    { s: 'AI Receptionist', t: 'AI Receptionist Objective', r: 'GoHighLevel Specialist' },
    { s: 'AI Receptionist', t: 'Retell Workspace', r: 'Project Manager' },
    { s: 'AI Receptionist', t: 'Add Client Payment Method', r: 'Project Manager' },
    { s: 'AI Receptionist', t: 'Purchase Number', r: 'GoHighLevel Specialist' },
  ]

  // Build dedup set from existing tasks
  const existingKeys = new Set(
    tasksSnap.docs.map(d => {
      const t = d.data()
      return `${t.client_id}|${t.titulo}`
    })
  )

  let count = 0
  for (let ci = 0; ci < clients.length; ci += 2) {
    const chunk = clients.slice(ci, ci + 2)
    const batch = writeBatch(db)

    for (const client of chunk) {
      for (const task of NEW_TASKS) {
        const secId = sections.find(s => s.nombre === task.s)?.id
        if (!secId) continue

        const key = `${client.id}|${task.t}`
        if (existingKeys.has(key)) continue

        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: task.t,
          responsable_rol: task.r,
          seccion_id: secId,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'low',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
        })
        count++
      }
    }

    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_created: count })
}

// ─── PATCH V15: delete Video Ad Creation & Image Ad Creation tasks ──────────
export const runPatchV15 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v15_delete_video_image_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Find Video Ad Creation & Image Ad Creation sections
  const sectionIdsToDelete = new Set()
  for (const s of sections) {
    if (s.nombre === 'Video Ad Creation' || s.nombre === 'Image Ad Creation') {
      sectionIdsToDelete.add(s.id)
    }
  }

  // Delete all tasks in those sections
  const tasksToDelete = tasksSnap.docs.filter(d => sectionIdsToDelete.has(d.data().seccion_id))
  let tasksCount = 0
  for (let i = 0; i < tasksToDelete.length; i += 400) {
    const batch = writeBatch(db)
    tasksToDelete.slice(i, i + 400).forEach(d => {
      batch.delete(d.ref)
      tasksCount++
    })
    await batch.commit()
  }

  // Delete the sections themselves
  let sectionsCount = 0
  for (let i = 0; i < sections.length; i += 400) {
    const batch = writeBatch(db)
    sections.slice(i, i + 400).forEach(s => {
      if (sectionIdsToDelete.has(s.id)) {
        batch.delete(doc(db, 'checklist_sections', s.id))
        sectionsCount++
      }
    })
    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_deleted: tasksCount, sections_deleted: sectionsCount })
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
