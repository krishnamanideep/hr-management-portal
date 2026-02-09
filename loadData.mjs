// Load data from attendance.xlsx into Firestore
import * as XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import { readFileSync } from 'fs';

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

async function loadData() {
    try {
        console.log('📖 Reading attendance.xlsx...');
        const fileBuffer = readFileSync('./public/attendance.xlsx');
        const wb = XLSX.read(fileBuffer, { type: 'buffer' });

        const ws = wb.Sheets['Sheet1'];
        const data = XLSX.utils.sheet_to_json(ws);

        console.log(`👥 Found ${data.length} employee records`);

        let batch = writeBatch(db);
        let empCount = 0;
        let batchCount = 0;

        // Determine which month/year from the data (assuming January 2026 based on context)
        const year = 2026;
        const month = 0; // January (0-indexed)

        // Import Employees and Attendance
        const attByDate = {};

        for (const [index, row] of data.entries()) {
            const empId = row['S.NO']?.toString() || `EMP-${index + 1}`;
            const name = row['Name'];
            const hiring = row['Hiring'] || 'General';

            if (!name) continue;

            // Import Employee
            const empRef = doc(db, 'employees', empId);
            batch.set(empRef, {
                id: empId,
                name: name,
                position: hiring,
                department: hiring, // Using Hiring as department
                email: '',
                phone: row['PHONE NUMBER']?.toString() || '',
                joiningDate: row['DOJ'] || new Date().toISOString().split('T')[0],
                status: row['STATUS'] === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
                salary_structure: {
                    basic: Number(row['Promised Salary'] || 0),
                    hra: 0,
                    allowances: 0
                },
                shift: {
                    start: '09:00',
                    end: '18:00'
                }
            }, { merge: true });

            empCount++;
            batchCount++;

            // Parse Attendance (columns 1-31 represent days)
            for (let day = 1; day <= 31; day++) {
                const dayValue = row[day.toString()];
                if (dayValue === 'P' || dayValue === 'p') {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    if (!attByDate[dateStr]) attByDate[dateStr] = [];
                    attByDate[dateStr].push(empId);
                }
            }

            // Commit every 400 operations
            if (batchCount >= 400) {
                await batch.commit();
                console.log(`✅ Committed batch (${empCount} employees so far)`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        // Commit remaining employees
        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Final employee batch committed`);
        }

        console.log(`✨ Imported ${empCount} employees successfully!`);

        // Import Attendance
        console.log(`📅 Processing attendance data...`);
        batch = writeBatch(db);
        batchCount = 0;
        let attCount = 0;

        for (const [date, presentIds] of Object.entries(attByDate)) {
            const attRef = doc(db, 'attendance', date);
            batch.set(attRef, { presentIds }, { merge: true });
            attCount++;
            batchCount++;

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`✅ Committed attendance batch (${attCount} days so far)`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Final attendance batch committed`);
        }

        console.log(`✨ Imported attendance for ${attCount} days!`);

        console.log('\n🎉 Data import completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Employees: ${empCount}`);
        console.log(`   - Attendance records: ${attCount} days (January 2026)`);
        console.log(`   - Departments populated from "Hiring" column`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error loading data:', error);
        process.exit(1);
    }
}

loadData();
