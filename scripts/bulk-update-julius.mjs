#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// Usar el archivo de credenciales
const serviceAccount = JSON.parse(
  fs.readFileSync('/Users/jorgealvarez/Downloads/lucky-group-consultation-firebase-adminsdk-fbsvc-3fce81dd79.json', 'utf8')
);

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'lucky-group-consultation'
});

const db = getFirestore(app);

async function updateAllJulius() {
  console.log('🔄 Obteniendo TODAS las tareas de Julius...\n');

  const JULIUS_ID = 'iFNXxo0UviWpujqz0a14d11KRzn2';
  const KEVIN_ID = 'c2BA4E68uyWsGR0rPhf2al5YOHJ2';

  try {
    const snapshot = await db.collection('checklist_tasks')
      .where('responsable_id', '==', JULIUS_ID)
      .get();

    console.log(`✓ Encontradas ${snapshot.size} tareas de Julius\n`);

    let updated = 0;
    let deleted = 0;

    for (const doc of snapshot.docs) {
      const task = doc.data();
      await db.collection('checklist_tasks').doc(doc.id).update({
        responsable_id: KEVIN_ID,
        actualizado_en: new Date().toISOString()
      });
      updated++;

      if (updated % 50 === 0) {
        console.log(`   ✓ ${updated} tareas actualizadas...`);
      }
    }

    console.log(`\n✅ Completado: ${updated} tareas actualizadas a Kevin`);

    // Borrar LSA en Google Ads
    console.log('\n🗑️  Buscando tareas LSA en Google Ads...');

    const sectionsSnap = await db.collection('checklist_sections')
      .where('area', '==', 'google_ads')
      .get();

    const googleAdsSectionIds = sectionsSnap.docs.map(d => d.id);
    console.log(`✓ ${googleAdsSectionIds.length} secciones Google Ads`);

    const tasksSnap = await db.collection('checklist_tasks').get();
    const lsaTasks = tasksSnap.docs.filter(doc => {
      const task = doc.data();
      return googleAdsSectionIds.includes(task.seccion_id) && 
             task.titulo && task.titulo.includes('LSA');
    });

    console.log(`✓ ${lsaTasks.length} tareas LSA encontradas\n`);

    for (const doc of lsaTasks) {
      await db.collection('checklist_tasks').doc(doc.id).delete();
      deleted++;
      console.log(`   ✓ Borrada: ${doc.data().titulo}`);
    }

    console.log(`\n✅ ¡Completado! ${updated} tareas → Kevin, ${deleted} LSA borradas`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateAllJulius();
