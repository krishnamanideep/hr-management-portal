// Update all employees to Field Team department
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

async function standardizeDepartments() {
    try {
        console.log('🔄 Standardizing departments to Field Team...');

        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`👥 Found ${employees.length} employees`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedCount = 0;

        for (const emp of employees) {
            const empRef = doc(db, 'employees', emp.id);
            batch.update(empRef, { department: 'Field Team' });
            updatedCount++;
            batchCount++;

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`✅ Updated ${updatedCount} employees...`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Department standardization complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Total employees: ${employees.length}`);
        console.log(`   - All updated to: Field Team`);
        console.log(`   - Departments: 1 (was 24)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

standardizeDepartments();
