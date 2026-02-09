// Add specific employees as Zonal Managers
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

// Zonal Manager assignments
const zonalManagers = [
    { name: 'nizhanth', zone: 'West Zone' },
    { name: 'padmashri', zone: 'Karaikal Zone' },
    { name: 'shifana', zone: 'Central Zone' },
    { name: 'saaminathan', zone: 'North Zone' },
    { name: 'saminathan', zone: 'North Zone' }, // Alternative spelling
    { name: 'kiri', zone: 'South Zone' },
    { name: 'kirithorran', zone: 'South Zone' }, // Full name
    { name: 'akbar', zone: 'East Zone' }
];

async function addZonalManagers() {
    try {
        console.log('👔 Adding Zonal Managers...');

        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`👥 Found ${employees.length} employees`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedCount = 0;

        const foundManagers = [];

        for (const emp of employees) {
            const nameLower = (emp.name || '').toLowerCase();

            // Check if this employee is a zonal manager
            const zmMatch = zonalManagers.find(zm => nameLower.includes(zm.name));

            if (zmMatch) {
                const empRef = doc(db, 'employees', emp.id);
                batch.update(empRef, {
                    position: 'Zonal Manager (ZM)',
                    department: zmMatch.zone
                });

                foundManagers.push({ name: emp.name, zone: zmMatch.zone });
                updatedCount++;
                batchCount++;

                console.log(`✅ ${emp.name} → Zonal Manager (${zmMatch.zone})`);

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

        console.log('\n✅ Zonal Managers added!');
        console.log(`📊 Summary:`);
        console.log(`   - Total employees: ${employees.length}`);
        console.log(`   - Zonal Managers added: ${updatedCount}`);
        console.log(`\n👔 Zonal Managers:`);
        foundManagers.forEach(zm => {
            console.log(`   - ${zm.name} (${zm.zone})`);
        });

        if (updatedCount < 6) {
            console.log(`\n⚠️  Warning: Expected 6 Zonal Managers, but only found ${updatedCount}`);
            console.log(`   Missing managers might not exist in the database or have different names.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addZonalManagers();
