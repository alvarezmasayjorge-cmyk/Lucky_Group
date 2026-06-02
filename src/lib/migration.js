import { db } from './firebase'
import { collection, doc, writeBatch, getDocs, query, limit } from 'firebase/firestore'
import { TEMPLATE_SECTIONS, TEMPLATE_TASKS } from './templateTasks'

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
