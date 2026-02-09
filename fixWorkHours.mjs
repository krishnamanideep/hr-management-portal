// Fix attendance to ensure work hours for ALL present days
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

async function fixWorkHours() {
    try {
        console.log('🔧 Fixing work hours for all present employees...');

        // Get all attendance records
        const attSnapshot = await getDocs(collection(db, 'attendance'));
        console.log(`📅 Found ${attSnapshot.docs.length} attendance records`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let fixedCount = 0;
        let totalPresent = 0;
        let totalWithHours = 0;

        for (const attDoc of attSnapshot.docs) {
            const data = attDoc.data();
            const presentIds = data.presentIds || [];
            const workHours = data.workHours || {};

            totalPresent += presentIds.length;

            // Ensure EVERY present employee has work hours
            let needsUpdate = false;
            presentIds.forEach(empId => {
                if (!workHours[empId]) {
                    workHours[empId] = getRandomWorkHours();
                    needsUpdate = true;
                } else {
                    totalWithHours++;
                }
            });

            if (needsUpdate) {
                const attRef = doc(db, 'attendance', attDoc.id);
                batch.set(attRef, {
                    presentIds: presentIds,
                    workHours: workHours
                });

                fixedCount++;
                batchCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`✅ Committed batch (${fixedCount} records fixed)`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Work hours fix complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Attendance records processed: ${attSnapshot.docs.length}`);
        console.log(`   - Records updated: ${fixedCount}`);
        console.log(`   - Total present entries: ${totalPresent}`);
        console.log(`   - Entries that already had hours: ${totalWithHours}`);
        console.log(`   - Entries that needed hours added: ${totalPresent - totalWithHours}`);
        console.log(`   - ✅ ALL present employees now have work hours!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixWorkHours();
