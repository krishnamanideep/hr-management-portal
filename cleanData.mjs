// Clean duplicates and generate realistic attendance data
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

async function cleanAndGenerate() {
    try {
        console.log('🧹 Step 1: Cleaning up duplicate employees...');

        // Get all employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        console.log(`Found ${employees.length} employee records`);

        // Find duplicates by name
        const nameMap = new Map();
        const duplicates = [];

        employees.forEach(emp => {
            const name = emp.name?.toLowerCase();
            if (name) {
                if (nameMap.has(name)) {
                    duplicates.push(emp.id);
                } else {
                    nameMap.set(name, emp.id);
                }
            }
        });

        // Delete duplicates
        if (duplicates.length > 0) {
            console.log(`🗑️  Deleting ${duplicates.length} duplicate employees...`);
            for (const id of duplicates) {
                await deleteDoc(doc(db, 'employees', id));
            }
        }

        // Get clean employee list
        const cleanEmpSnapshot = await getDocs(collection(db, 'employees'));
        const cleanEmployees = cleanEmpSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        console.log(`✅ Clean employee count: ${cleanEmployees.length}`);

        // Step 2: Clear old attendance
        console.log('🧹 Step 2: Clearing old attendance data...');
        const attSnapshot = await getDocs(collection(db, 'attendance'));
        for (const attDoc of attSnapshot.docs) {
            await deleteDoc(doc(db, 'attendance', attDoc.id));
        }
        console.log('✅ Old attendance cleared');

        // Step 3: Generate new attendance with work hours
        console.log('📅 Step 3: Generating attendance for Dec 2025 - Feb 2026...');

        const startDate = new Date('2025-12-01');
        const endDate = new Date(); // Today

        let batch = writeBatch(db);
        let batchCount = 0;
        let dayCount = 0;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();

            // Skip Sundays
            if (dayOfWeek === 0) continue;

            const attendanceData = {
                presentIds: [],
                workHours: {}
            };

            cleanEmployees.forEach(emp => {
                // 85-95% attendance rate (higher on weekdays)
                const attendanceChance = dayOfWeek === 6 ? 0.7 : 0.9;

                if (Math.random() < attendanceChance) {
                    attendanceData.presentIds.push(emp.id);
                    // Random work hours between 5-9
                    const hours = (Math.random() * 4 + 5).toFixed(1);
                    attendanceData.workHours[emp.id] = parseFloat(hours);
                }
            });

            const attRef = doc(db, 'attendance', dateStr);
            batch.set(attRef, attendanceData);
            batchCount++;
            dayCount++;

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`✅ Committed batch (${dayCount} days processed)`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Final batch committed`);
        }

        console.log('\n🎉 Data cleanup and generation complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Clean employees: ${cleanEmployees.length}`);
        console.log(`   - Duplicates removed: ${duplicates.length}`);
        console.log(`   - Attendance days generated: ${dayCount}`);
        console.log(`   - Date range: Dec 1, 2025 - ${endDate.toISOString().split('T')[0]}`);
        console.log(`   - Work hours: 5-9 hours (random per employee per day)`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanAndGenerate();
