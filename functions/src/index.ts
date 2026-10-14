import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/**
 * 1. Set Custom Claims for Multi-Clinic RBAC
 * Grants 'role' (dentist | assistant | secretary) and 'clinicId' to Firebase Auth token
 */
export const setUserClaims = functions
  .region('europe-west9')
  .https.onCall(async (data, context) => {
    // Only dentists or system admin can change claims
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const callerRole = context.auth.token.role;
    if (callerRole !== 'dentist' && !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only clinic dentists can assign roles.'
      );
    }

    const { targetUid, role, clinicId } = data;
    if (!targetUid || !role || !clinicId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'targetUid, role, and clinicId are required.'
      );
    }

    await auth.setCustomUserClaims(targetUid, { role, clinicId });

    // Keep user document synced
    await db.doc(`clinics/${clinicId}/users/${targetUid}`).set(
      {
        role,
        clinicId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, message: `Claims set for user ${targetUid}` };
  });

/**
 * 2. Scheduled Task: Prepare Daily Next-Day Appointment Reminders (WhatsApp)
 * Runs every day at 18:00 in Africa/Casablanca timezone
 */
export const prepareDailyReminders = functions
  .region('europe-west9')
  .pubsub.schedule('0 18 * * *')
  .timeZone('Africa/Casablanca')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateStr = tomorrow.toISOString().slice(0, 10);

    functions.logger.info(`Running scheduled reminder list preparation for ${tomorrowDateStr}`);

    // Query appointments across all clinics for tomorrow
    const snapshot = await db
      .collectionGroup('appointments')
      .where('status', '==', 'scheduled')
      .where('reminderSent', '==', false)
      .get();

    let count = 0;
    const batch = db.batch();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.startTime && data.startTime.startsWith(tomorrowDateStr)) {
        batch.update(doc.ref, {
          reminderPrepared: true,
          reminderPreparedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }

    functions.logger.info(`Prepared ${count} appointment reminders for ${tomorrowDateStr}`);
    return { preparedReminders: count };
  });

/**
 * 3. Immutable CNDP Audit Trail Trigger
 * Automatically records document creations, modifications and deletions
 */
export const onPatientModified = functions
  .region('europe-west9')
  .firestore.document('clinics/{clinicId}/patients/{patientId}')
  .onWrite(async (change, context) => {
    const { clinicId, patientId } = context.params;
    const isDelete = !change.after.exists;
    const isCreate = !change.before.exists;

    const action = isDelete ? 'delete' : isCreate ? 'create' : 'update';

    const auditRef = db.collection(`clinics/${clinicId}/auditLogs`).doc();
    await auditRef.set({
      id: auditRef.id,
      action,
      resourceType: 'patient',
      resourceId: patientId,
      patientId,
      performedBy: 'system-trigger',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        note: `Automatic CNDP compliance audit log for patient ${patientId}`,
      },
    });
  });
