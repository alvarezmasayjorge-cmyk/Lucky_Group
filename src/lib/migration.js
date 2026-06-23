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
    { nombre: 'Funnel', area: 'ghl', orden: 9 },
    { nombre: 'Workflow Automation', area: 'ghl', orden: 10 },
    { nombre: 'Tracking/Setup', area: 'ghl', orden: 11 },
    { nombre: 'AI Receptionist', area: 'ghl', orden: 12 },
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

// ─── PATCH V16: delete Video Ad Creation & Image Ad Creation sections ───────
export const runPatchV16 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v16_delete_video_image_sections')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  // Find and delete Video Ad Creation & Image Ad Creation sections
  let count = 0
  for (const s of sections) {
    if (s.nombre === 'Video Ad Creation' || s.nombre === 'Image Ad Creation') {
      await deleteDoc(doc(db, 'checklist_sections', s.id))
      count++
    }
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, sections_deleted: count })
}

// ─── PATCH V17: delete Video/Image Ad Creation sections (fuzzy match) ───────
export const runPatchV17 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v17_delete_video_image_fuzzy')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  const sectionIdsToDelete = new Set()
  for (const s of sections) {
    const name = (s.nombre || '').toLowerCase()
    if (name.includes('video ad creation') || name.includes('image ad creation')) {
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

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_deleted: tasksCount })
}

// ─── PATCH V18: delete only tasks inside Video/Image Ad Creation sections ────
export const runPatchV18 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v18_clear_video_image_tasks')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const [sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  const sectionIds = new Set()
  for (const s of sections) {
    const name = (s.nombre || '').toLowerCase()
    if (name.includes('video ad creation') || name.includes('image ad creation')) {
      sectionIds.add(s.id)
    }
  }

  const tasksToDelete = tasksSnap.docs.filter(d => sectionIds.has(d.data().seccion_id))
  let tasksCount = 0
  for (let i = 0; i < tasksToDelete.length; i += 400) {
    const batch = writeBatch(db)
    tasksToDelete.slice(i, i + 400).forEach(d => {
      batch.delete(d.ref)
      tasksCount++
    })
    await batch.commit()
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_deleted: tasksCount })
}

// ─── PATCH V19: recreate Video/Image Ad Creation sections (empty) ───────────
export const runPatchV19 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v19_recreate_video_image_sections')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  const hasVideo = sections.some(s => (s.nombre || '').toLowerCase().includes('video ad creation'))
  const hasImage = sections.some(s => (s.nombre || '').toLowerCase().includes('image ad creation'))

  const maxOrden = Math.max(...sections.map(s => s.orden || 0), 0)
  let created = 0

  if (!hasVideo) {
    const ref = doc(collection(db, 'checklist_sections'))
    await setDoc(ref, { nombre: 'Video Ad Creation', area: 'meta_ads', orden: maxOrden + 1, creado_en: now })
    created++
  }

  if (!hasImage) {
    const ref = doc(collection(db, 'checklist_sections'))
    await setDoc(ref, { nombre: 'Image Ad Creation', area: 'meta_ads', orden: maxOrden + 2, creado_en: now })
    created++
  }

  await setDoc(patchRef, { applied_at: now, applied_by: userId, sections_created: created })
}

export const runPatchV20 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v20_onboarding_separate_tab')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const now = new Date().toISOString()

  let updated = 0
  const batch = writeBatch(db)
  for (const sec of sections) {
    if (sec.nombre === 'Onboarding Process' && sec.area !== 'onboarding') {
      batch.update(doc(db, 'checklist_sections', sec.id), { area: 'onboarding' })
      updated++
    }
  }
  if (updated > 0) await batch.commit()

  await setDoc(patchRef, { applied_at: now, applied_by: userId, sections_updated: updated })
}

export const runPatchV21 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v21_delete_asphalt_client')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  const clientsSnap = await getDocs(collection(db, 'clients'))
  const asphalt = clientsSnap.docs.find(d => d.data().name === 'Asphalt')
  if (!asphalt) {
    await setDoc(patchRef, { applied_at: new Date().toISOString(), applied_by: userId, skipped: true })
    return
  }

  const clientId = asphalt.id
  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const clientTasks = tasksSnap.docs.filter(d => d.data().client_id === clientId)

  // Delete tasks in batches of 400
  for (let i = 0; i < clientTasks.length; i += 400) {
    const batch = writeBatch(db)
    clientTasks.slice(i, i + 400).forEach(t => batch.delete(doc(db, 'checklist_tasks', t.id)))
    await batch.commit()
  }

  // Delete the client document
  await deleteDoc(doc(db, 'clients', clientId))

  await setDoc(patchRef, {
    applied_at: new Date().toISOString(),
    applied_by: userId,
    deleted_client: 'Asphalt',
    tasks_deleted: clientTasks.length,
  })
}

export const runPatchV22 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v22_copy_owners_from_complete_wellness')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  // 1. Source client = "Complete Wellness Chiropractic" (the template/base)
  const clientsSnap = await getDocs(collection(db, 'clients'))
  const source = clientsSnap.docs.find(d => d.data().name === 'Complete Wellness Chiropractic')
  if (!source) {
    console.warn('[v22] Source client "Complete Wellness Chiropractic" not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const sourceId = source.id

  // 2. Julius = profile whose rol_equipo is "GoHighLevel Specialist"
  const profilesSnap = await getDocs(collection(db, 'profiles'))
  const julius = profilesSnap.docs.find(d => d.data().rol_equipo === 'GoHighLevel Specialist')
  if (!julius) {
    console.warn('[v22] GoHighLevel Specialist profile (Julius) not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const juliusId = julius.id

  // 3. Excluded sections: Video Ad Creation / Image Ad Creation (normalize "6. " prefix)
  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const EXCLUDED = ['video ad creation', 'image ad creation']
  const norm = (s) => (s || '').replace(/^\d+\.\s*/, '').trim().toLowerCase()
  const excludedSectionIds = new Set(
    sectionsSnap.docs.filter(d => EXCLUDED.includes(norm(d.data().nombre))).map(d => d.id)
  )

  // 4. Load all tasks
  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // 5. Desired-owner map from the source client, keyed by `${seccion_id}|${titulo}`
  const ownerMap = new Map()
  for (const t of allTasks) {
    if (t.client_id !== sourceId) continue
    if (excludedSectionIds.has(t.seccion_id)) continue
    const key = `${t.seccion_id}|${t.titulo}`
    if (t.responsable_id) {
      ownerMap.set(key, { responsable_id: t.responsable_id, responsable_rol: t.responsable_rol ?? null })
    } else {
      // empty in Complete Wellness -> Julius (GoHighLevel Specialist)
      ownerMap.set(key, { responsable_id: juliusId, responsable_rol: 'GoHighLevel Specialist' })
    }
  }

  // 6. Apply to ALL clients (incl. Complete Wellness, to fill its own empties with Julius)
  const now = new Date().toISOString()
  const updates = []
  for (const t of allTasks) {
    if (excludedSectionIds.has(t.seccion_id)) continue
    const desired = ownerMap.get(`${t.seccion_id}|${t.titulo}`)
    if (!desired) continue
    if (t.responsable_id === desired.responsable_id && (t.responsable_rol ?? null) === desired.responsable_rol) continue
    updates.push({ id: t.id, desired })
  }

  // 7. Commit in batches of 400
  for (let i = 0; i < updates.length; i += 400) {
    const batch = writeBatch(db)
    updates.slice(i, i + 400).forEach(u => batch.update(doc(db, 'checklist_tasks', u.id), {
      responsable_id: u.desired.responsable_id,
      responsable_rol: u.desired.responsable_rol,
      actualizado_en: now,
    }))
    await batch.commit()
  }

  console.log(`[v22] Copied owners from Complete Wellness Chiropractic — tasks_updated: ${updates.length}`)

  await setDoc(patchRef, {
    applied_at: now,
    applied_by: userId,
    source_client: 'Complete Wellness Chiropractic',
    tasks_updated: updates.length,
  })
}

// Re-apply of v22 with a fresh guard + more robust Julius lookup, so it runs
// again even on DBs where v22 already committed its guard.
export const runPatchV23 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v23_reassign_owners_from_complete_wellness')
  const patchSnap = await getDoc(patchRef)
  if (patchSnap.exists()) return

  // 1. Source client = "Complete Wellness Chiropractic" (the template/base)
  const clientsSnap = await getDocs(collection(db, 'clients'))
  const source = clientsSnap.docs.find(d => d.data().name === 'Complete Wellness Chiropractic')
  if (!source) {
    console.warn('[v23] Source client "Complete Wellness Chiropractic" not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const sourceId = source.id

  // 2. Julius = GoHighLevel Specialist. Match by role first, then by name as fallback.
  const profilesSnap = await getDocs(collection(db, 'profiles'))
  const profs = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const julius =
    profs.find(p => p.rol_equipo === 'GoHighLevel Specialist') ||
    profs.find(p => (p.nombre_completo || '').toLowerCase().includes('julius'))
  if (!julius) {
    console.warn('[v23] GoHighLevel Specialist profile (Julius) not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const juliusId = julius.id

  // 3. Excluded sections: Video Ad Creation / Image Ad Creation (normalize "6. " prefix)
  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const EXCLUDED = ['video ad creation', 'image ad creation']
  const norm = (s) => (s || '').replace(/^\d+\.\s*/, '').trim().toLowerCase()
  const excludedSectionIds = new Set(
    sectionsSnap.docs.filter(d => EXCLUDED.includes(norm(d.data().nombre))).map(d => d.id)
  )

  // 4. Load all tasks
  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // 5. Desired-owner map from the source client, keyed by `${seccion_id}|${titulo}`
  const ownerMap = new Map()
  for (const t of allTasks) {
    if (t.client_id !== sourceId) continue
    if (excludedSectionIds.has(t.seccion_id)) continue
    const key = `${t.seccion_id}|${t.titulo}`
    // "Empty" = no real person assigned in Complete Wellness -> Julius
    if (t.responsable_id) {
      ownerMap.set(key, { responsable_id: t.responsable_id, responsable_rol: t.responsable_rol ?? null })
    } else {
      ownerMap.set(key, { responsable_id: juliusId, responsable_rol: 'GoHighLevel Specialist' })
    }
  }

  // 6. Apply to ALL clients (incl. Complete Wellness, to fill its own empties with Julius)
  const now = new Date().toISOString()
  const updates = []
  for (const t of allTasks) {
    if (excludedSectionIds.has(t.seccion_id)) continue
    const desired = ownerMap.get(`${t.seccion_id}|${t.titulo}`)
    if (!desired) continue
    if (t.responsable_id === desired.responsable_id && (t.responsable_rol ?? null) === desired.responsable_rol) continue
    updates.push({ id: t.id, desired })
  }

  // 7. Commit in batches of 400
  for (let i = 0; i < updates.length; i += 400) {
    const batch = writeBatch(db)
    updates.slice(i, i + 400).forEach(u => batch.update(doc(db, 'checklist_tasks', u.id), {
      responsable_id: u.desired.responsable_id,
      responsable_rol: u.desired.responsable_rol,
      actualizado_en: now,
    }))
    await batch.commit()
  }

  console.log(`[v23] Reassigned owners from Complete Wellness Chiropractic — tasks_updated: ${updates.length}, julius: ${julius.nombre_completo || juliusId}`)

  await setDoc(patchRef, {
    applied_at: now,
    applied_by: userId,
    source_client: 'Complete Wellness Chiropractic',
    julius_id: juliusId,
    tasks_updated: updates.length,
  })
}

// Resilient re-apply of the owner copy. Unlike v22/v23, this does NOT abort
// when the Julius profile is missing: it always copies the assigned owners
// (Karla, Jorge, Jens, Phill, ...) and only fills empty tasks with Julius if
// that profile exists.
export const runPatchV25 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v25_copy_owners_resilient')
  if ((await getDoc(patchRef)).exists()) return

  // 1. Source client = "Complete Wellness Chiropractic" (the template/base)
  const clientsSnap = await getDocs(collection(db, 'clients'))
  const source = clientsSnap.docs.find(d => d.data().name === 'Complete Wellness Chiropractic')
  if (!source) {
    console.warn('[v25] Source client "Complete Wellness Chiropractic" not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const sourceId = source.id

  // 2. Julius (GoHighLevel Specialist) — optional. Do NOT abort if missing.
  const profilesSnap = await getDocs(collection(db, 'profiles'))
  const profs = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const julius =
    profs.find(p => p.rol_equipo === 'GoHighLevel Specialist') ||
    profs.find(p => (p.nombre_completo || '').toLowerCase().includes('julius'))
  const juliusId = julius ? julius.id : null
  if (!juliusId) {
    console.warn('[v25] Julius (GoHighLevel Specialist) profile not found — copying assigned owners only; empty tasks left as-is.')
  }

  // 3. Excluded sections: Video Ad Creation / Image Ad Creation
  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const EXCLUDED = ['video ad creation', 'image ad creation']
  const norm = (s) => (s || '').replace(/^\d+\.\s*/, '').trim().toLowerCase()
  const excludedSectionIds = new Set(
    sectionsSnap.docs.filter(d => EXCLUDED.includes(norm(d.data().nombre))).map(d => d.id)
  )

  // 4. Load all tasks
  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const allTasks = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // 5. Desired-owner map from the source client
  const ownerMap = new Map()
  for (const t of allTasks) {
    if (t.client_id !== sourceId) continue
    if (excludedSectionIds.has(t.seccion_id)) continue
    const key = `${t.seccion_id}|${t.titulo}`
    if (t.responsable_id) {
      ownerMap.set(key, { responsable_id: t.responsable_id, responsable_rol: t.responsable_rol ?? null })
    } else if (juliusId) {
      ownerMap.set(key, { responsable_id: juliusId, responsable_rol: 'GoHighLevel Specialist' })
    }
    // empty source + no Julius -> not added to map, targets left untouched
  }

  // 6. Apply to ALL clients
  const now = new Date().toISOString()
  const updates = []
  for (const t of allTasks) {
    if (excludedSectionIds.has(t.seccion_id)) continue
    const desired = ownerMap.get(`${t.seccion_id}|${t.titulo}`)
    if (!desired) continue
    if (t.responsable_id === desired.responsable_id && (t.responsable_rol ?? null) === desired.responsable_rol) continue
    updates.push({ id: t.id, desired })
  }

  for (let i = 0; i < updates.length; i += 400) {
    const batch = writeBatch(db)
    updates.slice(i, i + 400).forEach(u => batch.update(doc(db, 'checklist_tasks', u.id), {
      responsable_id: u.desired.responsable_id,
      responsable_rol: u.desired.responsable_rol,
      actualizado_en: now,
    }))
    await batch.commit()
  }

  console.log(`[v25] Copied owners (resilient) — tasks_updated: ${updates.length}, julius_found: ${!!juliusId}`)

  await setDoc(patchRef, {
    applied_at: now,
    applied_by: userId,
    source_client: 'Complete Wellness Chiropractic',
    julius_found: !!juliusId,
    tasks_updated: updates.length,
  })
}

// Canonical order of the "Funnels" (GHL) section tasks, matching Julius's sheet:
// Funnel -> Workflow Automation -> Tracking/Setup.
const FUNNELS_TASK_ORDER = [
  'Build funnel according to strategy', // sheet label: "Funnel Building"
  'Client Assets',
  'Purchase Lookalike Domain',
  'Client Offer',
  'Tracking code installation',
  'CAPI Conversion',
  'Google Number Pool Conversion',
  'New Lead Optin - Did not schedule',
  'Booked Appointment Reminder',
  'No Show/Cancelled Appointment Win-back',
  'Pipeline Changed To No Show/Cancelled',
  'Lead to AI Outbound Call',
  'Get and Place Call: Outbound + Inbound',
  'Reactivation Call: Stale Customer',
  'Lead Type Updater & Aging',
  'Inbound Message Internal Notification',
  'Missed Call Text Back',
  'Integration',
  'Integration (Meta)',
  'Integrate Domain',
  'Set and Validate Dedicated Sending Domain',
  'A2P Application',
  'Google Lead Event Creation',
]

// Set `orden` on every "Funnels" section task (all clients) so the board shows
// them in Julius's sheet order. Tasks render sorted by `orden`.
export const runPatchV24 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v24_order_funnels_tasks')
  if ((await getDoc(patchRef)).exists()) return

  const norm = (s) => (s || '').replace(/^\d+\.\s*/, '').trim().toLowerCase()

  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const funnelsSectionIds = new Set(
    sectionsSnap.docs.filter(d => norm(d.data().nombre) === 'funnels').map(d => d.id)
  )
  if (funnelsSectionIds.size === 0) {
    console.warn('[v24] No "Funnels" section found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }

  // title (normalized) -> position. Include alias for the renamed first task.
  const orderIndex = new Map()
  FUNNELS_TASK_ORDER.forEach((t, i) => orderIndex.set(t.toLowerCase(), i))
  orderIndex.set('funnel building', 0)

  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const now = new Date().toISOString()
  const updates = []
  tasksSnap.docs.forEach(d => {
    const t = d.data()
    if (!funnelsSectionIds.has(t.seccion_id)) return
    const idx = orderIndex.get((t.titulo || '').trim().toLowerCase())
    if (idx === undefined) return
    if (t.orden === idx) return
    updates.push({ id: d.id, orden: idx })
  })

  for (let i = 0; i < updates.length; i += 400) {
    const batch = writeBatch(db)
    updates.slice(i, i + 400).forEach(u => batch.update(doc(db, 'checklist_tasks', u.id), {
      orden: u.orden,
      actualizado_en: now,
    }))
    await batch.commit()
  }

  console.log(`[v24] Ordered Funnels tasks — tasks_updated: ${updates.length}`)

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_updated: updates.length })
}

// Split the single GHL "Funnels" section into the 4-section structure from
// Julius's sheet: Funnel -> Workflow Automation -> Tracking/Setup -> AI Receptionist.
// Creates the two new sections, renames "Funnels" -> "Funnel", and moves each
// task (all clients) to its target section with the right order.
export const runPatchV26 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v26_split_ghl_sections')
  if ((await getDoc(patchRef)).exists()) return

  const now = new Date().toISOString()
  const norm = (s) => (s || '').replace(/^\d+\.\s*/, '').trim().toLowerCase()

  const sectionsSnap = await getDocs(collection(db, 'checklist_sections'))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  const funnelSec = sections.find(s => s.area === 'ghl' && ['funnels', 'funnel'].includes(norm(s.nombre)))
  if (!funnelSec) {
    console.warn('[v26] GHL "Funnels" section not found — skipping (will retry next load).')
    return // do NOT write guard, retry on next mount
  }
  const aiSec = sections.find(s => s.area === 'ghl' && norm(s.nombre) === 'ai receptionist')

  // find-or-create the two new GHL sections
  const findOrCreate = async (name, orden) => {
    const existing = sections.find(s => s.area === 'ghl' && norm(s.nombre) === norm(name))
    if (existing) return existing.id
    const ref = doc(collection(db, 'checklist_sections'))
    await setDoc(ref, { nombre: name, area: 'ghl', orden, creado_en: now })
    return ref.id
  }
  const waId = await findOrCreate('Workflow Automation', 10)
  const tsId = await findOrCreate('Tracking/Setup', 11)

  // rename Funnels -> Funnel and fix section order
  const secBatch = writeBatch(db)
  secBatch.update(doc(db, 'checklist_sections', funnelSec.id), { nombre: 'Funnel', orden: 9 })
  if (aiSec) secBatch.update(doc(db, 'checklist_sections', aiSec.id), { orden: 12 })
  await secBatch.commit()

  // task title -> { sectionId, orden } (canonical order from the sheet)
  const FUNNEL = ['Build funnel according to strategy', 'Client Assets', 'Purchase Lookalike Domain', 'Client Offer', 'Tracking code installation']
  const WORKFLOW = ['CAPI Conversion', 'Google Number Pool Conversion', 'New Lead Optin - Did not schedule', 'Booked Appointment Reminder', 'No Show/Cancelled Appointment Win-back', 'Pipeline Changed To No Show/Cancelled', 'Lead to AI Outbound Call', 'Get and Place Call: Outbound + Inbound', 'Reactivation Call: Stale Customer', 'Lead Type Updater & Aging', 'Inbound Message Internal Notification', 'Missed Call Text Back']
  const TRACKING = ['Integration', 'Integration (Meta)', 'Integrate Domain', 'Set and Validate Dedicated Sending Domain', 'A2P Application', 'Google Lead Event Creation']
  const AIR = ['Prompt', 'AI Receptionist Objective', 'Retell Workspace', 'Add Client Payment Method', 'Purchase Number']

  const map = new Map()
  FUNNEL.forEach((t, i) => map.set(t.toLowerCase(), { sectionId: funnelSec.id, orden: i }))
  map.set('funnel building', { sectionId: funnelSec.id, orden: 0 }) // alias for renamed first task
  WORKFLOW.forEach((t, i) => map.set(t.toLowerCase(), { sectionId: waId, orden: i }))
  TRACKING.forEach((t, i) => map.set(t.toLowerCase(), { sectionId: tsId, orden: i }))
  if (aiSec) AIR.forEach((t, i) => map.set(t.toLowerCase(), { sectionId: aiSec.id, orden: i }))

  const ghlSectionIds = new Set([funnelSec.id, aiSec?.id].filter(Boolean))
  const tasksSnap = await getDocs(collection(db, 'checklist_tasks'))
  const updates = []
  tasksSnap.docs.forEach(d => {
    const t = d.data()
    if (!ghlSectionIds.has(t.seccion_id)) return
    const target = map.get((t.titulo || '').trim().toLowerCase())
    if (!target) return
    if (t.seccion_id === target.sectionId && t.orden === target.orden) return
    updates.push({ id: d.id, seccion_id: target.sectionId, orden: target.orden })
  })

  for (let i = 0; i < updates.length; i += 400) {
    const batch = writeBatch(db)
    updates.slice(i, i + 400).forEach(u => batch.update(doc(db, 'checklist_tasks', u.id), {
      seccion_id: u.seccion_id,
      orden: u.orden,
      actualizado_en: now,
    }))
    await batch.commit()
  }

  console.log(`[v26] Split GHL sections (Funnel / Workflow Automation / Tracking/Setup / AI Receptionist) — tasks_updated: ${updates.length}`)

  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_updated: updates.length })
}

// ─── PATCH V27: create global LSA section + seed 3 tasks for every client ────
export const runPatchV27 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v27_add_lsa_section')
  if ((await getDoc(patchRef)).exists()) return

  const now = new Date().toISOString()

  const [clientsSnap, sectionsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_sections')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const clients = clientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const sections = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Find or create the global LSA section
  let lsaSection = sections.find(s => s.area === 'lsa' && s.nombre === 'LSA')
  if (!lsaSection) {
    const ref = doc(collection(db, 'checklist_sections'))
    await setDoc(ref, { nombre: 'LSA', area: 'lsa', orden: 5, creado_en: now })
    lsaSection = { id: ref.id, nombre: 'LSA', area: 'lsa' }
  }

  // Build dedup set: "clientId|sectionId|titulo"
  const existingKeys = new Set(
    tasksSnap.docs.map(d => {
      const t = d.data()
      return `${t.client_id}|${t.seccion_id}|${t.titulo}`
    })
  )

  const LSA_TASKS = [
    { title: 'Get LSA Approved', role: 'Google Specialist' },
    { title: 'Verify Settings',  role: 'Google Specialist' },
    { title: 'Launch Campaigns', role: 'Google Specialist' },
  ]

  let count = 0
  for (let i = 0; i < clients.length; i += 4) {
    const batch = writeBatch(db)
    for (const client of clients.slice(i, i + 4)) {
      LSA_TASKS.forEach((tpl, idx) => {
        const key = `${client.id}|${lsaSection.id}|${tpl.title}`
        if (existingKeys.has(key)) return
        const taskRef = doc(collection(db, 'checklist_tasks'))
        batch.set(taskRef, {
          titulo: tpl.title,
          responsable_rol: tpl.role,
          seccion_id: lsaSection.id,
          client_id: client.id,
          status: 'pending',
          completed: false,
          prioridad: 'medium',
          responsable_id: null,
          creado_por: userId,
          creado_en: now,
          actualizado_en: now,
          orden: idx,
        })
        count++
      })
    }
    await batch.commit()
  }

  console.log(`[v27] LSA section seeded — tasks_added: ${count}`)
  await setDoc(patchRef, { applied_at: now, applied_by: userId, tasks_added: count })
}

// ─── PATCH V28: delete 4 churned clients and all their tasks ─────────────────
export const runPatchV28 = async (userId) => {
  const patchRef = doc(db, 'patches', 'v28_delete_churned_clients')
  if ((await getDoc(patchRef)).exists()) return

  const now = new Date().toISOString()
  const NAMES_TO_DELETE = [
    'Main Street Chiropractic',
    'All Dry Services of North Las Vegas',
    'All Around Asphalt',
    'Green Z Remodeling',
  ]

  const [clientsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, 'clients')),
    getDocs(collection(db, 'checklist_tasks')),
  ])

  const targets = clientsSnap.docs.filter(d => NAMES_TO_DELETE.includes(d.data().name))
  const targetIds = new Set(targets.map(d => d.id))

  const taskDocs = tasksSnap.docs.filter(d => targetIds.has(d.data().client_id))

  // Delete tasks in batches of 400
  for (let i = 0; i < taskDocs.length; i += 400) {
    const batch = writeBatch(db)
    taskDocs.slice(i, i + 400).forEach(d => batch.delete(d.ref))
    await batch.commit()
  }

  // Delete client documents
  for (let i = 0; i < targets.length; i += 400) {
    const batch = writeBatch(db)
    targets.slice(i, i + 400).forEach(d => batch.delete(d.ref))
    await batch.commit()
  }

  console.log(`[v28] Deleted ${targets.length} clients and ${taskDocs.length} tasks`)
  await setDoc(patchRef, { applied_at: now, applied_by: userId, clients_deleted: targets.length, tasks_deleted: taskDocs.length })
}

// Apply the standard template (sections + tasks) to an EXISTING client, limited
// to the chosen areas (e.g. ['onboarding','meta_ads','google_ads','lsa','ghl']).
// - Creates any missing global section that the template needs for those areas.
// - Seeds the template tasks for the client, skipping ones it already has
//   (matched by title + section) so it's safe to run more than once.
// Returns { created, sectionsCreated }.
export const applyTemplateToClient = async (clientId, userId, selectedAreas, globalSections, existingClientTasks = []) => {
  const now = new Date().toISOString()
  const areas = new Set(selectedAreas)

  // Sections from the template that belong to the selected areas.
  const neededSections = TEMPLATE_SECTIONS.filter(s => areas.has(s.area))

  // Work on a mutable copy so we can append newly-created sections.
  let sections = [...globalSections]
  let sectionsCreated = 0
  const maxOrden = Math.max(...sections.map(s => s.orden || 0), 0)

  // Create any missing global sections first (need their IDs for the tasks).
  for (const tpl of neededSections) {
    const exists = sections.find(s => s.nombre === tpl.name && s.area === tpl.area)
    if (exists) continue
    const ref = doc(collection(db, 'checklist_sections'))
    const data = { nombre: tpl.name, area: tpl.area, orden: maxOrden + 1 + sectionsCreated, creado_en: now }
    await setDoc(ref, data)
    sections.push({ id: ref.id, ...data })
    sectionsCreated++
  }

  // Names of sections in the chosen areas.
  const sectionNamesInAreas = new Set(neededSections.map(s => s.name))

  // Build a lookup of tasks the client already has (per section) to avoid dupes.
  const existingKey = new Set(
    existingClientTasks.map(t => `${t.seccion_id}|||${(t.titulo || '').trim()}`)
  )

  const tasksToCreate = TEMPLATE_TASKS.filter(t => sectionNamesInAreas.has(t.sectionName))

  let created = 0
  let buffer = []
  for (const tpl of tasksToCreate) {
    const section = sections.find(s => s.nombre === tpl.sectionName)
    if (!section) continue
    const key = `${section.id}|||${tpl.title.trim()}`
    if (existingKey.has(key)) continue
    buffer.push({ tpl, section })
  }

  for (let i = 0; i < buffer.length; i += 100) {
    const batch = writeBatch(db)
    buffer.slice(i, i + 100).forEach(({ tpl, section }) => {
      const taskRef = doc(collection(db, 'checklist_tasks'))
      batch.set(taskRef, {
        titulo: tpl.title,
        responsable_rol: tpl.role || null,
        seccion_id: section.id,
        client_id: clientId,
        completed: false,
        status: 'pending',
        prioridad: 'medium',
        responsable_id: null,
        creado_por: userId,
        creado_en: now,
        actualizado_en: now,
      })
      created++
    })
    await batch.commit()
  }

  return { created, sectionsCreated }
}

// ─── Custom team positions (roles) stored in Firestore ───────────────────────
// Built-in ROLES live in constants.js; these are extra positions the user adds
// (e.g. "Media Buyer", "Editor"). Stored as a single doc app_config/team_roles.
export const fetchCustomRoles = async () => {
  const ref = doc(db, 'app_config', 'team_roles')
  const snap = await getDoc(ref)
  if (!snap.exists()) return []
  return snap.data().roles || []
}

export const saveCustomRoles = async (roles) => {
  const ref = doc(db, 'app_config', 'team_roles')
  await setDoc(ref, { roles, actualizado_en: new Date().toISOString() })
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
