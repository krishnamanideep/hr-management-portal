// Check current departments in database
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkDepartments() {
    try {
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`\n📊 Total Employees: ${employees.length}\n`);

        // Group by department
        const deptMap = new Map();

        employees.forEach(emp => {
            const dept = emp.department || 'No Department';
            if (!deptMap.has(dept)) {
                deptMap.set(dept, []);
            }
            deptMap.get(dept).push(emp.name);
        });

        console.log(`📁 Departments Found: ${deptMap.size}\n`);

        // Sort by employee count
        const sorted = Array.from(deptMap.entries())
            .sort((a, b) => b[1].length - a[1].length);

        sorted.forEach(([dept, employees]) => {
            console.log(`\n${dept} (${employees.length} employees):`);
            employees.forEach(name => console.log(`  - ${name}`));
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkDepartments();
