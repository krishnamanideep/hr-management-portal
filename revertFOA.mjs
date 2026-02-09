// Delete all FOA employees and restore original state
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';

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

async function revertFOAImport() {
    try {
        console.log('🔄 Reverting FOA employee import...');

        // Get all employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`📊 Found ${employees.length} total employees`);

        // Delete all employees with FOA- prefix
        let batch = writeBatch(db);
        let batchCount = 0;
        let deletedCount = 0;

        for (const emp of employees) {
            if (emp.id.startsWith('FOA-')) {
                const empRef = doc(db, 'employees', emp.id);
                batch.delete(empRef);
                deletedCount++;
                batchCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    console.log(`✅ Deleted ${deletedCount} FOA employees...`);
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        // Also remove manager field from remaining employees
        const remainingSnapshot = await getDocs(collection(db, 'employees'));
        const remainingEmployees = remainingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        batch = writeBatch(db);
        batchCount = 0;

        for (const emp of remainingEmployees) {
            if (emp.manager) {
                const { manager, ...empWithoutManager } = emp;
                const empRef = doc(db, 'employees', emp.id);
                batch.set(empRef, empWithoutManager);
                batchCount++;

                if (batchCount >= 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    batchCount = 0;
                }
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Revert complete!');
        console.log(`📊 Summary:`);
        console.log(`   - FOA employees deleted: ${deletedCount}`);
        console.log(`   - Remaining employees: ${remainingEmployees.length}`);
        console.log(`   - Manager field removed from all employees`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

revertFOAImport();
