// Clean attendance data to only include current employees
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

async function cleanAttendanceData() {
    try {
        console.log('🧹 Cleaning attendance data...');

        // Get current employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const validEmployeeIds = new Set(empSnapshot.docs.map(doc => doc.id));
        console.log(`👥 Found ${validEmployeeIds.size} current employees`);

        // Get all attendance records
        const attSnapshot = await getDocs(collection(db, 'attendance'));
        console.log(`📅 Found ${attSnapshot.docs.length} attendance records`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedCount = 0;
        let totalRemoved = 0;

        for (const attDoc of attSnapshot.docs) {
            const data = attDoc.data();
            const presentIds = data.presentIds || [];
            const workHours = data.workHours || {};

            // Filter to only include current employees
            const validPresentIds = presentIds.filter(id => validEmployeeIds.has(id));
            const validWorkHours = {};

            for (const [empId, hours] of Object.entries(workHours)) {
                if (validEmployeeIds.has(empId)) {
                    validWorkHours[empId] = hours;
                }
            }

            const removedCount = presentIds.length - validPresentIds.length;

            if (removedCount > 0) {
                const attRef = doc(db, 'attendance', attDoc.id);
                batch.set(attRef, {
                    presentIds: validPresentIds,
                    workHours: validWorkHours
                });

                updatedCount++;
                totalRemoved += removedCount;
                batchCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`✅ Committed batch (${updatedCount} records updated)`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Attendance data cleaned!');
        console.log(`📊 Summary:`);
        console.log(`   - Current employees: ${validEmployeeIds.size}`);
        console.log(`   - Attendance records updated: ${updatedCount}`);
        console.log(`   - Invalid employee references removed: ${totalRemoved}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanAttendanceData();
