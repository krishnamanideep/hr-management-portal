import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs an action to the audit_logs collection.
 * @param {string} action - Short action name (e.g., 'EMPLOYEE_CREATE', 'ATTENDANCE_UPDATE')
 * @param {string} details - Human-readable description of what happened
 * @param {object} changes - { before: any, after: any } optional state change tracking
 * @param {string} reason - Optional reason provided by the admin
 */
export const logAudit = async (action, details, changes = null, reason = '') => {
    try {
        const user = auth.currentUser;
        await addDoc(collection(db, 'audit_logs'), {
            action,
            details,
            changes,
            reason,
            adminEmail: user ? user.email : 'System',
            adminId: user ? user.uid : 'System',
            timestamp: serverTimestamp()
        });
    } catch (err) {
        console.error("Audit Logging Failed:", err);
    }
};
