#!/usr/bin/env node

import fetch from 'node-fetch';

const PROJECT_ID = 'lucky-group-consultation';
const API_KEY = 'AIzaSyCBRvlRYCi58a2B9aXXFyuFhGvvK-uT9kk';

const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function makeRequest(method, path, body = null) {
  const url = `${BASE_URL}${path}?key=${API_KEY}`;

  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error (${response.status}): ${text}`);
  }

  return response.json();
}

async function getAllDocuments(collection) {
  const url = `${BASE_URL}/${collection}?key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.documents || [];
}

function extractFieldValue(field) {
  if (field.stringValue) return field.stringValue;
  if (field.arrayValue) return field.arrayValue.values || [];
  if (field.mapValue) return field.mapValue.fields || {};
  if (field.booleanValue) return field.booleanValue;
  return null;
}

async function updateTasksJuliusToKevin() {
  console.log('🚀 Iniciando actualización de tareas...\n');

  try {
    // 1. Obtener perfiles
    console.log('👤 Obteniendo perfiles...');
    const profiles = await getAllDocuments('profiles');

    const profilesMap = {};
    profiles.forEach(doc => {
      const id = doc.name.split('/').pop();
      const data = doc.fields || {};
      profilesMap[id] = {
        nombre_completo: extractFieldValue(data.nombre_completo)
      };
    });

    console.log('Perfiles encontrados:');
    Object.entries(profilesMap).forEach(([id, p]) => {
      console.log(`   - ${p.nombre_completo} (${id})`);
    });

    // Encontrar Julius y Kevin
    const [juliusId] = Object.entries(profilesMap).find(([id, p]) =>
      p.nombre_completo && (p.nombre_completo.includes('Julius') || p.nombre_completo.includes('Juliu'))
    ) || [];

    const [kevinId] = Object.entries(profilesMap).find(([id, p]) =>
      p.nombre_completo && p.nombre_completo.includes('Kevin')
    ) || [];

    if (!juliusId) {
      console.error('❌ No se encontró el perfil de Julius');
      process.exit(1);
    }
    if (!kevinId) {
      console.error('❌ No se encontró el perfil de Kevin');
      process.exit(1);
    }

    console.log(`\n✓ Julius ID: ${juliusId}`);
    console.log(`✓ Kevin ID: ${kevinId}\n`);

    // 2. Obtener tareas
    console.log('📋 Obteniendo tareas...');
    const tasks = await getAllDocuments('checklist_tasks');

    const juliusTasks = tasks.filter(doc => {
      const fields = doc.fields || {};
      const titulo = extractFieldValue(fields.titulo);
      const responsableId = extractFieldValue(fields.responsable_id);

      return responsableId === juliusId || (titulo && titulo.includes('(@Julius)'));
    });

    console.log(`✓ Tareas de Julius encontradas: ${juliusTasks.length}\n`);

    if (juliusTasks.length > 0) {
      console.log('⏳ Actualizando tareas...');
      for (const taskDoc of juliusTasks) {
        const docId = taskDoc.name.split('/').pop();
        const fields = taskDoc.fields || {};
        const titulo = extractFieldValue(fields.titulo);
        const newTitulo = titulo.replace('(@Julius)', '(@Kevin)');

        const updateBody = {
          fields: {
            ...fields,
            titulo: { stringValue: newTitulo },
            responsable_id: { stringValue: kevinId },
            actualizado_en: { timestampValue: new Date().toISOString() }
          }
        };

        await makeRequest('PATCH', `/checklist_tasks/${docId}`, updateBody);
        console.log(`   ✓ ${titulo}`);
        console.log(`      → ${newTitulo}`);
      }
    }

    // 3. Obtener secciones de Google Ads y borrar LSA
    console.log('\n📋 Obteniendo secciones...');
    const sections = await getAllDocuments('checklist_sections');

    const googleAdsSectionIds = sections
      .filter(doc => {
        const fields = doc.fields || {};
        const area = extractFieldValue(fields.area);
        return area === 'google_ads';
      })
      .map(doc => doc.name.split('/').pop());

    console.log(`✓ Secciones Google Ads encontradas: ${googleAdsSectionIds.length}`);

    if (googleAdsSectionIds.length > 0) {
      const lsaTasks = tasks.filter(doc => {
        const fields = doc.fields || {};
        const titulo = extractFieldValue(fields.titulo);
        const seccionId = extractFieldValue(fields.seccion_id);

        return googleAdsSectionIds.includes(seccionId) && titulo && titulo.includes('LSA');
      });

      console.log(`✓ Tareas LSA en Google Ads encontradas: ${lsaTasks.length}\n`);

      if (lsaTasks.length > 0) {
        console.log('🗑️  Borrando tareas LSA...');
        for (const taskDoc of lsaTasks) {
          const docId = taskDoc.name.split('/').pop();
          const fields = taskDoc.fields || {};
          const titulo = extractFieldValue(fields.titulo);

          await makeRequest('DELETE', `/checklist_tasks/${docId}`);
          console.log(`   ✓ Borrada: ${titulo}`);
        }
      }
    }

    console.log('\n✅ ¡Actualización completada!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updateTasksJuliusToKevin();
