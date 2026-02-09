// Generate attendance for new employees (3 new FOAs + 6 ZMs)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';

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

function shouldBePresent(dayOfWeek) {
    if (dayOfWeek === 0) return false; // Sunday off
    if (dayOfWeek === 6) return Math.random() < 0.85; // Saturday 85%
    return Math.random() < 0.95; // Weekdays 95%
}

async function addAttendanceForNewEmployees() {
    try {
        console.log('📅 Adding attendance for new employees...\n');

        // Get all employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get all attendance records
        const attSnapshot = await getDocs(collection(db, 'attendance'));
        const attendanceRecords = {};
        attSnapshot.docs.forEach(doc => {
            attendanceRecords[doc.id] = doc.data();
        });

        console.log(`👥 Total employees: ${employees.length}`);
        console.log(`📅 Existing attendance records: ${attSnapshot.docs.length}`);

        // Find new employees (those not in any attendance record)
        const allPresentIds = new Set();
        Object.values(attendanceRecords).forEach(record => {
            (record.presentIds || []).forEach(id => allPresentIds.add(id));
        });

        const newEmployees = employees.filter(emp => !allPresentIds.has(emp.id));
        console.log(`\n➕ New employees needing attendance: ${newEmployees.length}`);
        newEmployees.forEach(emp => {
            console.log(`   - ${emp.name} (${emp.position})`);
        });

        if (newEmployees.length === 0) {
            console.log('\n✅ All employees already have attendance records!');
            process.exit(0);
        }

        // Generate attendance for Dec 2025 - Feb 2026
        const startDate = new Date('2025-12-01');
        const endDate = new Date('2026-02-09');

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedDays = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();

            // Get existing attendance for this date
            const existingRecord = attendanceRecords[dateStr] || { presentIds: [], workHours: {} };
            const presentIds = [...existingRecord.presentIds];
            const workHours = { ...existingRecord.workHours };

            let addedToday = 0;

            // Add new employees to this date if they should be present
            newEmployees.forEach(emp => {
                if (shouldBePresent(dayOfWeek)) {
                    presentIds.push(emp.id);
                    workHours[emp.id] = getRandomWorkHours();
                    addedToday++;
                }
            });

            // Update attendance record if we added anyone
            if (addedToday > 0) {
                const attRef = doc(db, 'attendance', dateStr);
                batch.set(attRef, {
                    presentIds: presentIds,
                    workHours: workHours
                });

                updatedDays++;
                batchCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`💾 Committed batch (${updatedDays} days updated)`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Attendance generation complete!');
        console.log(`📊 Summary:`);
        console.log(`   - New employees: ${newEmployees.length}`);
        console.log(`   - Days updated: ${updatedDays}`);
        console.log(`   - Date range: Dec 1, 2025 - Feb 9, 2026`);
        console.log(`   - Attendance rate: ~95% weekdays, ~85% Saturdays`);
        console.log(`   - Work hours: 5-9 hours per day`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAttendanceForNewEmployees();
