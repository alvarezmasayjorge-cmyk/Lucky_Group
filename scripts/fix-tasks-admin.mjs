#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Try to load service account from environment or file
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
  }
}

if (!serviceAccount) {
  console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_JSON not set');
  console.error('\nYou need to provide Firebase Admin credentials.');
  console.error('\nTo get credentials:');
  console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Export the JSON content as environment variable:');
  console.error('   export FIREBASE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'lucky-group-consultation'
  });
} catch (e) {
  console.error('Error initializing Firebase Admin:', e.message);
  process.exit(1);
}

const db = admin.firestore();

async function fixTasks() {
  console.log('🚀 Fixing task assignments...\n');

  try {
    // 1. Get profiles
    console.log('👤 Getting profiles...');
    const profilesSnap = await db.collection('profiles').get();
    const profiles = {};
    profilesSnap.forEach(doc => {
      profiles[doc.id] = doc.data();
    });

    const juliusProfile = Object.entries(profiles).find(([id, p]) =>
      p.nombre_completo && (p.nombre_completo.includes('Julius') || p.nombre_completo.includes('Juliu'))
    );
    const kevinProfile = Object.entries(profiles).find(([id, p]) =>
      p.nombre_completo && p.nombre_completo.includes('Kevin')
    );

    if (!juliusProfile || !kevinProfile) {
      console.error('❌ Could not find Julius or Kevin profiles');
      process.exit(1);
    }

    const [juliusId, juliusData] = juliusProfile;
    const [kevinId, kevinData] = kevinProfile;

    console.log(`✓ Julius: ${juliusData.nombre_completo}`);
    console.log(`✓ Kevin: ${kevinData.nombre_completo}\n`);

    // 2. Get all tasks
    console.log('📋 Getting all tasks...');
    const tasksSnap = await db.collection('checklist_tasks').get();
    const allTasks = [];
    tasksSnap.forEach(doc => {
      allTasks.push({ id: doc.id, ...doc.data() });
    });

    // Find Julius tasks
    const juliusTasks = allTasks.filter(task =>
      task.responsable_id === juliusId ||
      (task.titulo && task.titulo.includes('(@Julius)'))
    );

    console.log(`Found ${juliusTasks.length} tasks assigned to Julius\n`);

    // 3. Update Julius tasks to Kevin
    if (juliusTasks.length > 0) {
      console.log('⏳ Updating Julius tasks to Kevin...');
      for (const task of juliusTasks) {
        const newTitulo = task.titulo.replace('(@Julius)', '(@Kevin)');
        await db.collection('checklist_tasks').doc(task.id).update({
          responsable_id: kevinId,
          titulo: newTitulo,
          actualizado_en: new Date().toISOString()
        });
        console.log(`   ✓ ${task.titulo}`);
      }
    }

    // 4. Delete LSA tasks in Google Ads
    console.log('\n📋 Getting sections...');
    const sectionsSnap = await db.collection('checklist_sections').get();
    const googleAdsSections = [];
    sectionsSnap.forEach(doc => {
      const section = doc.data();
      if (section.area === 'google_ads') {
        googleAdsSections.push({ id: doc.id, ...section });
      }
    });

    if (googleAdsSections.length > 0) {
      const googleAdsSectionIds = googleAdsSections.map(s => s.id);
      const lsaTasks = allTasks.filter(task =>
        googleAdsSectionIds.includes(task.seccion_id) &&
        task.titulo && task.titulo.includes('LSA')
      );

      console.log(`Found ${lsaTasks.length} LSA tasks in Google Ads\n`);

      if (lsaTasks.length > 0) {
        console.log('🗑️  Deleting LSA tasks...');
        for (const task of lsaTasks) {
          await db.collection('checklist_tasks').doc(task.id).delete();
          console.log(`   ✓ ${task.titulo}`);
        }
      }
    }

    console.log('\n✅ All tasks updated successfully!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixTasks();
