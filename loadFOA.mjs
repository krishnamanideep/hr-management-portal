// Load FOA employee data with hierarchy
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, setDoc } from 'firebase/firestore';

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

// FOA Employee Data
const foaEmployees = [
    { sno: 1, role: "State Lead", area: "State Level", doj: "1/10/2025", name: "Jakka Loknath Reddy", phone: "9121069594", manager: null },
    { sno: 2, role: "Zonal Manager", area: "Zone 1", doj: "18/10/2025", name: "Padmashri R", phone: "9043005720", manager: "Jakka Loknath Reddy" },
    { sno: 3, role: "Zonal Manager", area: "Zone 2", doj: "12/12/2025", name: "Shifana Benazir M", phone: "9787426236", manager: "Jakka Loknath Reddy" },
    { sno: 4, role: "Zonal Manager", area: "Zone 3", doj: "24/12/2025", name: "Kirithorran V", phone: "7708975621", manager: "Jakka Loknath Reddy" },
    { sno: 5, role: "Zonal Manager", area: "Zone 4", doj: "20/10/2025", name: "Saminathan R", phone: "9780205309", manager: "Jakka Loknath Reddy" },
    { sno: 6, role: "Zonal Manager", area: "Zone 5", doj: "18/10/2025", name: "Nizhanth Savari A", phone: "6379871573", manager: "Jakka Loknath Reddy" },
    { sno: 7, role: "Zonal Manager", area: "Zone 6", doj: "29/12/2025", name: "Akbar", phone: "8754357750", manager: "Jakka Loknath Reddy" },
    { sno: 8, role: "Campaign Associate", area: "Central / HQ", doj: "12/1/2026", name: "Ajeeth", phone: "9384126773", manager: "Jakka Loknath Reddy" },
    { sno: 9, role: "Campaign Associate", area: "Central / HQ", doj: "1/12/2025", name: "Deva kumar J", phone: "9385312917", manager: "Jakka Loknath Reddy" },
    { sno: 10, role: "Campaign Associate", area: "Central / HQ", doj: "1/1/2026", name: "Ramcharan", phone: "9014988068", manager: "Jakka Loknath Reddy" },
    { sno: 12, role: "Third Party Associate", area: "External", doj: "30/1/2026", name: "Yashasvi Talwar", phone: "7975830602", manager: "Jakka Loknath Reddy" },
    { sno: 13, role: "Third Party Associate", area: "External", doj: "25/12/2025", name: "Dhamodharan S", phone: "9840486604", manager: "Jakka Loknath Reddy" },
    { sno: 14, role: "Assembly Associate", area: "Mannadipet", doj: "29/12/2025", name: "Sarathi R", phone: "9047158733", manager: "Nizhanth Savari A" },
    { sno: 15, role: "Assembly Associate", area: "Mannadipet", doj: "29/12/2025", name: "Deivanai K", phone: "9500408075", manager: "Nizhanth Savari A" },
    { sno: 16, role: "Assembly Associate", area: "Mannadipet", doj: "19/12/2025", name: "Jeevananthan B", phone: "9750332950", manager: "Nizhanth Savari A" },
    { sno: 17, role: "Assembly Associate", area: "Mannadipet", doj: "19/12/2025", name: "Prakash", phone: "9894583701", manager: "Nizhanth Savari A" },
    { sno: 18, role: "Assembly Associate", area: "Ossudu", doj: "5/1/2026", name: "Keerthi U", phone: "9042402411", manager: "Nizhanth Savari A" },
    { sno: 19, role: "Assembly Associate", area: "Ossudu", doj: "12/1/2026", name: "Valarmathi", phone: "9042402411", manager: "Nizhanth Savari A" },
    { sno: 20, role: "Assembly Associate", area: "Thirubhuvanai", doj: "7/1/2026", name: "Arun Jetli D", phone: "9750208233", manager: "Nizhanth Savari A" },
    { sno: 21, role: "Assembly Associate", area: "Thirubhuvanai", doj: "22/12/2025", name: "Veeramanikandan B", phone: "9500602841", manager: "Nizhanth Savari A" },
    { sno: 22, role: "Assembly Associate", area: "Thirubhuvanai", doj: "26/12/2025", name: "Selva Sundaram S", phone: "7418436776", manager: "Nizhanth Savari A" },
    { sno: 23, role: "Assembly Associate", area: "Mangalam", doj: "5/1/2026", name: "Ajai", phone: "9655070678", manager: "Nizhanth Savari A" },
    { sno: 24, role: "Assembly Associate", area: "Mangalam", doj: "5/1/2026", name: "Sridharan", phone: "9442528970", manager: "Nizhanth Savari A" },
    { sno: 25, role: "Assembly Associate", area: "Villianur", doj: "7/1/2026", name: "Balachandran B", phone: "9385996339", manager: "Nizhanth Savari A" },
    { sno: 26, role: "Assembly Associate", area: "Villianur", doj: "8/1/2026", name: "Arunkumar C", phone: "9159681920", manager: "Nizhanth Savari A" },
    { sno: 27, role: "Assembly Associate", area: "Karaikal South", doj: "12/1/2026", name: "Narendran K", phone: "7010997058", manager: "Padmashri R" },
    { sno: 28, role: "Assembly Associate", area: "Karaikal South", doj: "17/12/2025", name: "Arunagiri S", phone: "9342155972", manager: "Padmashri R" },
    { sno: 29, role: "Assembly Associate", area: "Raj Bhavan", doj: "17/12/2025", name: "Akbar Ali.H", phone: "9578215417", manager: "Jakka Loknath Reddy" },
    { sno: 30, role: "Assembly Associate", area: "Raj Bhavan", doj: "17/12/2025", name: "Hariharan V", phone: "8807686411", manager: "Jakka Loknath Reddy" },
    { sno: 31, role: "Assembly Associate", area: "Oupalam", doj: "29/12/2025", name: "Premkumar. N", phone: "9363590573", manager: "Jakka Loknath Reddy" },
    { sno: 32, role: "Assembly Associate", area: "Oupalam", doj: "23/12/2025", name: "Manikandan N", phone: "9025116525", manager: "Jakka Loknath Reddy" },
    { sno: 33, role: "Assembly Associate", area: "Thirunallar", doj: "6/1/2026", name: "Suvedha S", phone: "9894545455", manager: "Padmashri R" },
    { sno: 34, role: "Assembly Associate", area: "Thirunallar", doj: "6/1/2026", name: "Raguraman R", phone: "8637446604", manager: "Padmashri R" },
    { sno: 35, role: "Assembly Associate", area: "Thirunallar", doj: "6/1/2026", name: "Arun S", phone: "9025624043", manager: "Padmashri R" },
    { sno: 36, role: "Assembly Associate", area: "Karaikal North", doj: "6/1/2026", name: "Mohammed Thahsin H", phone: "8637446604", manager: "Padmashri R" },
    { sno: 37, role: "Assembly Associate", area: "Neravy T.R. Pattinam", doj: "6/1/2026", name: "Harikrishnan M", phone: "9159975040", manager: "Padmashri R" },
    { sno: 38, role: "Assembly Associate", area: "Neravy T.R. Pattinam", doj: "8/1/2026", name: "Nagaibabu P", phone: "7010557878", manager: "Padmashri R" },
    { sno: 39, role: "Assembly Associate", area: "Nedungadu", doj: "8/1/2026", name: "Prabhaharan R", phone: "9944862417", manager: "Padmashri R" },
    { sno: 40, role: "Assembly Associate", area: "Nedungadu", doj: "29/12/2025", name: "Antony Raj", phone: "8754357750", manager: "Padmashri R" },
    { sno: 41, role: "Assembly Associate", area: "Nedungadu", doj: "30/12/2025", name: "Madhana Gopal", phone: "6381950637", manager: "Padmashri R" },
    { sno: 42, role: "Assembly Associate", area: "Orleanpeth", doj: "9/1/2026", name: "Suresh Kumar S", phone: "9585328987", manager: "Jakka Loknath Reddy" },
    { sno: 43, role: "Assembly Associate", area: "Kadirgamam", doj: "8/1/2026", name: "Dinesh", phone: "9080050594", manager: "Shifana Benazir M" },
    { sno: 44, role: "Assembly Associate", area: "Kadirgamam", doj: "28/11/2025", name: "Dhakshavelan K", phone: "9751234822", manager: "Shifana Benazir M" },
    { sno: 45, role: "Assembly Associate", area: "Muthialpet", doj: "24/12/2025", name: "Karthik", phone: "9043231778", manager: "Shifana Benazir M" },
    { sno: 46, role: "Assembly Associate", area: "Muthialpet", doj: "11/12/2025", name: "Seetha R", phone: "9344872384", manager: "Shifana Benazir M" },
    { sno: 47, role: "Assembly Associate", area: "Ozhukarai", doj: "5/1/2026", name: "Vidhya", phone: "9342529961", manager: "Shifana Benazir M" },
    { sno: 48, role: "Assembly Associate", area: "Ozhukarai", doj: "29/11/2005", name: "Revin", phone: "7548883007", manager: "Shifana Benazir M" },
    { sno: 49, role: "Assembly Associate", area: "Indira nagar", doj: "8/1/2026", name: "Selladurai. S", phone: "9943309966", manager: "Shifana Benazir M" },
    { sno: 50, role: "Assembly Associate", area: "Indira nagar", doj: "8/1/2026", name: "Saravanan", phone: "9597895463", manager: "Shifana Benazir M" },
    { sno: 51, role: "Assembly Associate", area: "Indira nagar", doj: "8/1/2026", name: "Karthik S", phone: "9092324121", manager: "Shifana Benazir M" },
    { sno: 52, role: "Assembly Associate", area: "Indira nagar", doj: "29/12/2025", name: "Gokul", phone: "8248463644", manager: "Shifana Benazir M" },
    { sno: 53, role: "Assembly Associate", area: "Thattanchavady", doj: "8/1/2026", name: "Prabhu", phone: "8248195576", manager: "Shifana Benazir M" },
    { sno: 54, role: "Assembly Associate", area: "Kalapet", doj: "5/1/2026", name: "Vinoth", phone: "9150631703", manager: "Saminathan R" },
    { sno: 55, role: "Assembly Associate", area: "Kalapet", doj: "29/12/2025", name: "Karthick D", phone: "9626055206", manager: "Saminathan R" },
    { sno: 56, role: "Assembly Associate", area: "Mudaliyarpet", doj: "3/1/2026", name: "Kumaresh", phone: "7867851864", manager: "Saminathan R" },
    { sno: 57, role: "Assembly Associate", area: "Mudaliyarpet", doj: "5/1/2026", name: "Rajadurai", phone: "8098377221", manager: "Saminathan R" },
    { sno: 58, role: "Assembly Associate", area: "Mudaliyarpet", doj: "8/1/2026", name: "Senthurapandiyan. V", phone: "9342134676", manager: "Saminathan R" },
    { sno: 59, role: "Assembly Associate", area: "Lawspet", doj: "8/1/2026", name: "Kishore Kumar.R", phone: "9944061874", manager: "Saminathan R" },
    { sno: 60, role: "Assembly Associate", area: "Lawspet", doj: "6/1/2026", name: "Vishwa.V", phone: "8681839255", manager: "Saminathan R" },
    { sno: 61, role: "Assembly Associate", area: "Lawspet", doj: "7/1/2026", name: "Karthikeyan", phone: "9566474686", manager: "Saminathan R" },
    { sno: 62, role: "Assembly Associate", area: "Lawspet", doj: "24/12/2025", name: "Vinothini", phone: "8428139656", manager: "Saminathan R" },
    { sno: 63, role: "Assembly Associate", area: "Nellithope", doj: "8/1/2026", name: "Rajadurai D", phone: "7695885686", manager: "Saminathan R" },
    { sno: 64, role: "Assembly Associate", area: "Kamarajar Nagar", doj: "24/12/2025", name: "Dhinesh Kumar.S", phone: "7339626428", manager: "Saminathan R" },
    { sno: 65, role: "Assembly Associate", area: "Kamarajar Nagar", doj: "9/12/2025", name: "Ram Kumar P", phone: "9361924258", manager: "Saminathan R" },
    { sno: 66, role: "Assembly Associate", area: "Kamaraj Nagar", doj: "29/12/2025", name: "Pravin Raj", phone: "8220929994", manager: "Saminathan R" },
    { sno: 67, role: "Assembly Associate", area: "Bahour", doj: "29/12/2025", name: "Natpu Arasan", phone: "8754357750", manager: "Kirithorran V" },
    { sno: 68, role: "Assembly Associate", area: "Bahour", doj: "29/12/2025", name: "Akbar Ali.H", phone: "9047815599", manager: "Kirithorran V" },
    { sno: 69, role: "Assembly Associate", area: "Bahour", doj: "6/1/2026", name: "Anbu Arasan", phone: "860857632", manager: "Kirithorran V" },
    { sno: 70, role: "Assembly Associate", area: "Nettapakkam", doj: "5/1/2026", name: "Selambouli. V", phone: "8807672683", manager: "Kirithorran V" },
    { sno: 71, role: "Assembly Associate", area: "Nettapakkam", doj: "5/1/2026", name: "Hari Krishnan", phone: "8760880657", manager: "Kirithorran V" },
    { sno: 72, role: "Assembly Associate", area: "Manavely", doj: "5/1/2026", name: "Manish M", phone: "7868827087", manager: "Kirithorran V" },
    { sno: 73, role: "Assembly Associate", area: "Manavely", doj: "5/1/2026", name: "Iniyavan K", phone: "9080601459", manager: "Kirithorran V" },
    { sno: 74, role: "Assembly Associate", area: "Manavely", doj: "6/1/2026", name: "Yuvaraj R", phone: "9003988646", manager: "Kirithorran V" },
    { sno: 75, role: "Assembly Associate", area: "Embalam", doj: "8/1/2026", name: "Suresh Kumar K", phone: "9786554560", manager: "Kirithorran V" },
    { sno: 76, role: "Assembly Associate", area: "Ariyankuppam", doj: "8/1/2026", name: "Senthil Kumar R", phone: "9600265696", manager: "Kirithorran V" }
];

function parseDOJ(dojStr) {
    if (!dojStr || dojStr === '-') return new Date().toISOString().split('T')[0];

    // Handle formats like "1/10/2025", "29/12/25", etc.
    const parts = dojStr.split('/');
    if (parts.length === 3) {
        let day = parts[0];
        let month = parts[1];
        let year = parts[2];

        // Fix 2-digit year
        if (year.length === 2) {
            year = '20' + year;
        }

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return new Date().toISOString().split('T')[0];
}

async function loadFOAEmployees() {
    try {
        console.log('🚀 Loading FOA Employee Data...');

        // Get existing employees
        const existingSnapshot = await getDocs(collection(db, 'employees'));
        const existingEmployees = new Map();
        existingSnapshot.docs.forEach(doc => {
            const data = doc.data();
            existingEmployees.set(data.name?.toLowerCase(), { id: doc.id, ...data });
        });

        console.log(`📊 Found ${existingEmployees.size} existing employees`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let addedCount = 0;
        let updatedCount = 0;

        for (const emp of foaEmployees) {
            const empId = `FOA-${emp.sno}`;
            const nameLower = emp.name?.toLowerCase();

            // Check if employee already exists
            const existing = existingEmployees.get(nameLower);

            const employeeData = {
                id: existing?.id || empId,
                name: emp.name,
                position: emp.role,
                department: emp.area,
                email: '',
                phone: emp.phone || '',
                joiningDate: parseDOJ(emp.doj),
                status: 'ACTIVE',
                manager: emp.manager || null,
                salary_structure: existing?.salary_structure || {
                    basic: emp.role === 'State Lead' ? 50000 :
                        emp.role === 'Zonal Manager' ? 35000 :
                            emp.role === 'Campaign Associate' ? 25000 :
                                emp.role === 'Third Party Associate' ? 30000 :
                                    20000,
                    hra: 5000,
                    allowances: 3000
                },
                shift: existing?.shift || {
                    start: '09:00',
                    end: '18:00'
                }
            };

            const empRef = doc(db, 'employees', employeeData.id);
            batch.set(empRef, employeeData, { merge: true });

            if (existing) {
                updatedCount++;
            } else {
                addedCount++;
            }

            batchCount++;

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`✅ Committed batch (${addedCount} added, ${updatedCount} updated)`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
            console.log(`✅ Final batch committed`);
        }

        console.log('\n🎉 FOA Employee Data Loaded Successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - New employees added: ${addedCount}`);
        console.log(`   - Existing employees updated: ${updatedCount}`);
        console.log(`   - Total FOA employees: ${foaEmployees.length}`);
        console.log(`   - Hierarchy: State Lead → Zonal Managers → Assembly Associates`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

loadFOAEmployees();
