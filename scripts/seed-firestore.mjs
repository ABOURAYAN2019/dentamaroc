#!/usr/bin/env node
/**
 * DentaMaroc — Firestore Emulator Seed Script
 *
 * Usage:
 *   npm run seed
 *
 * Reads `seeds/demo-clinic-seed.json` and writes the fictional clinic, users,
 * procedures, patients, and odontogram tooth charts to the local Firestore Emulator
 * (http://127.0.0.1:8080) via the Firestore REST API.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(__dirname, '../seeds/demo-clinic-seed.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'dentamaroc-dev';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const clinicId = seedData.clinic.id;

console.log(`🦷 DentaMaroc Seed Dataset loaded from: ${seedPath}`);
console.log(`   Clinic:     ${seedData.clinic.name} (${clinicId})`);
console.log(`   Users:      ${seedData.users.length}`);
console.log(`   Procedures: ${seedData.procedures.length}`);
console.log(`   Patients:   ${seedData.patients.length}`);
console.log(`   Charts:     ${seedData.toothCharts.length}`);

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function writeDoc(collectionPath, docId, data) {
  const url = `http://${emulatorHost}/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?documentId=${encodeURIComponent(docId)}`;
  const fields = toFirestoreValue(data).mapValue.fields;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Failed writing ${collectionPath}/${docId}: ${res.status} ${text}`);
  }
}

async function main() {
  try {
    const ping = await fetch(`http://${emulatorHost}/`);
    if (!ping.ok) throw new Error('Emulator not reachable');
  } catch {
    console.log(
      `\nℹ️  Firestore Emulator is not running on ${emulatorHost}.\n` +
        `   Note: The frontend web app ('npm run dev') already loads this seed dataset in-memory automatically!\n` +
        `   To also seed the local Firebase Emulator, start 'npm run emulators' first and re-run 'npm run seed'.`
    );
    process.exit(0);
  }

  await writeDoc('clinics', clinicId, seedData.clinic);
  for (const user of seedData.users) {
    await writeDoc(`clinics/${clinicId}/users`, user.id, user);
  }
  for (const proc of seedData.procedures) {
    await writeDoc(`clinics/${clinicId}/procedures`, proc.id, proc);
  }
  for (const patient of seedData.patients) {
    await writeDoc(`clinics/${clinicId}/patients`, patient.id, patient);
  }
  for (const chart of seedData.toothCharts) {
    await writeDoc(`clinics/${clinicId}/toothCharts`, chart.id, chart);
  }

  console.log(`\n✅ Successfully seeded Firestore Emulator (${emulatorHost}) for project '${projectId}'!`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
