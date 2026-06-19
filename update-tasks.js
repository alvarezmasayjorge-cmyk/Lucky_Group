// Script para cambiar tareas de Julius a Kevin y borrar tarea LSA en Google Ads
// Ejecutar esto en la consola del navegador cuando estés autenticado

import { db } from './src/lib/firebase.js';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

async function updateTasksJuliusToKevin() {
  console.log('Iniciando actualización de tareas...');

  try {
    // 1. Obtener todos los perfiles para encontrar Julius y Kevin
    const profilesSnap = await getDocs(collection(db, 'profiles'));
    const profiles = {};
    profilesSnap.docs.forEach(doc => {
      profiles[doc.id] = doc.data();
    });

    console.log('Perfiles encontrados:', Object.entries(profiles).map(([id, p]) => `${p.nombre_completo} (${id})`));

    // Encontrar IDs de Julius y Kevin
    const juliusProfile = Object.entries(profiles).find(([id, p]) =>
      p.nombre_completo && (p.nombre_completo.includes('Julius') || p.nombre_completo.includes('Juliu'))
    );
    const kevinProfile = Object.entries(profiles).find(([id, p]) =>
      p.nombre_completo && p.nombre_completo.includes('Kevin')
    );

    if (!juliusProfile) {
      console.error('No se encontró el perfil de Julius');
      return;
    }
    if (!kevinProfile) {
      console.error('No se encontró el perfil de Kevin');
      return;
    }

    const [juliusId, juliusData] = juliusProfile;
    const [kevinId, kevinData] = kevinProfile;

    console.log(`Julius encontrado: ${juliusData.nombre_completo} (${juliusId})`);
    console.log(`Kevin encontrado: ${kevinData.nombre_completo} (${kevinId})`);

    // 2. Obtener todas las tareas asignadas a Julius
    const tasksSnap = await getDocs(collection(db, 'checklist_tasks'));
    const juliusTasks = tasksSnap.docs.filter(doc => {
      const task = doc.data();
      // Buscar por responsable_id o por el nombre en el título
      return task.responsable_id === juliusId ||
             (task.titulo && task.titulo.includes('(@Julius)'));
    });

    console.log(`Tareas de Julius encontradas: ${juliusTasks.length}`);
    juliusTasks.forEach(doc => {
      console.log(`  - ${doc.data().titulo}`);
    });

    // 3. Actualizar tareas de Julius a Kevin
    for (const taskDoc of juliusTasks) {
      const task = taskDoc.data();
      const newTitulo = task.titulo.replace('(@Julius)', `(@Kevin)`);

      await updateDoc(doc(db, 'checklist_tasks', taskDoc.id), {
        responsable_id: kevinId,
        titulo: newTitulo,
        actualizado_en: new Date().toISOString()
      });
      console.log(`✓ Actualizada: ${task.titulo} → ${newTitulo}`);
    }

    // 4. Encontrar y borrar la tarea de LSA en Google Ads
    const sectionsSnap = await getDocs(collection(db, 'checklist_sections'));
    const googleAdsSection = sectionsSnap.docs.find(doc => {
      const section = doc.data();
      return section.area === 'google_ads' && section.nombre && section.nombre.includes('Google');
    });

    if (googleAdsSection) {
      const googleAdsSectionId = googleAdsSection.id;
      const lsaTasks = tasksSnap.docs.filter(doc => {
        const task = doc.data();
        return task.seccion_id === googleAdsSectionId &&
               task.titulo && task.titulo.includes('LSA');
      });

      console.log(`Tareas LSA en Google Ads encontradas: ${lsaTasks.length}`);

      for (const taskDoc of lsaTasks) {
        const task = taskDoc.data();
        await deleteDoc(doc(db, 'checklist_tasks', taskDoc.id));
        console.log(`✓ Borrada: ${task.titulo}`);
      }
    } else {
      console.warn('No se encontró la sección Google Ads');
    }

    console.log('¡Actualización completada!');
  } catch (err) {
    console.error('Error durante la actualización:', err);
  }
}

// Ejecutar la función
updateTasksJuliusToKevin();
