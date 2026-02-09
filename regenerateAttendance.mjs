// Regenerate attendance with FULL December and work hours
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDWTXEm4zI8B3KIiZY0BLDmmTeLTFXvFWw",
    authDomain: "hr-portal-7721.firebaseapp.com",
    projectId: "hr-portal-7721",
    storageBucket: "hr-portal-7721.firebasestorage.app",
    messagingSenderId: "785301752712",
    appId: "1:785301752712:web:760ed5b1019f13b2d9883d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getRandomWorkHours() {
    return Math.floor(Math.random() * 5) + 5; // 5-9 hours
}

function shouldBePresent(month, dayOfWeek) {
    if (dayOfWeek === 0) return false; // Sunday

    // December: 98% attendance (almost full)
    if (month === 11) { // December is month 11
        if (dayOfWeek === 6) return Math.random() < 0.95; // Saturday 95%
        return Math.random() < 0.98; // Weekdays 98%
    }

    // January & February: 90% attendance
    if (dayOfWeek === 6) return Math.random() < 0.85; // Saturday 85%
    return Math.random() < 0.90; // Weekdays 90%
}

async function regenerateAttendance() {
    try {
        console.log('🧹 Clearing old attendance...');

        // Delete all existing attendance
        const attSnapshot = await getDocs(collection(db, 'attendance'));
        let batch = writeBatch(db);
        let count = 0;

        for (const attDoc of attSnapshot.docs) {
            batch.delete(doc(db, 'attendance', attDoc.id));
            count++;
            if (count >= 400) {
                await batch.commit();
                batch = writeBatch(db);
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
        }

        console.log(`✅ Cleared ${attSnapshot.docs.length} old attendance records`);
        console.log('\n📅 Generating new attendance with work hours...');

        // Get all employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`👥 Found ${employees.length} employees`);

        // Generate for Dec 2025 - Feb 2026
        const startDate = new Date('2025-12-01');
        const endDate = new Date('2026-02-09');

        batch = writeBatch(db);
        let batchCount = 0;
        let totalDays = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            const month = d.getMonth();

            const presentEmployees = [];
            const workHours = {};

            for (const emp of employees) {
                // Check if employee had joined by this date
                const joinDate = new Date(emp.joiningDate || '2025-01-01');
                if (d < joinDate) continue;

                if (shouldBePresent(month, dayOfWeek)) {
                    presentEmployees.push(emp.id);
                    workHours[emp.id] = getRandomWorkHours();
                }
            }

            if (presentEmployees.length > 0) {
                const attRef = doc(db, 'attendance', dateStr);
                batch.set(attRef, {
                    presentIds: presentEmployees,
                    workHours: workHours
                });

                batchCount++;
                totalDays++;

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`✅ Committed batch (${totalDays} days processed)`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n🎉 Attendance regeneration complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Total employees: ${employees.length}`);
        console.log(`   - Days generated: ${totalDays}`);
        console.log(`   - Date range: Dec 1, 2025 - Feb 9, 2026`);
        console.log(`   - December attendance: 98% (almost full)`);
        console.log(`   - Jan/Feb attendance: 90%`);
        console.log(`   - Work hours: 5-9 hours (random per employee per day)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

regenerateAttendance();
