// Import FOA data and organize team structure
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

// FOA data from user
const foaData = [
    { zone: "West Zone", zm: "Nizhanth", ac: "Mannadipet", name: "Sarathi R", contact: "9047158733" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Mannadipet", name: "Deivanai K", contact: "9500408075" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Mannadipet", name: "Jeevananthan B", contact: "9750332950" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Mannadipet", name: "Prakash", contact: "9894583701" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Ossudu", name: "Keerthi U", contact: "9042402411" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Ossudu", name: "Valarmathi", contact: "9042402411" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Thirubhuvanai", name: "Arun Jetli D", contact: "9750208233" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Thirubhuvanai", name: "Veeramanikandan B", contact: "9500602841" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Thirubhuvanai", name: "Selva Sundaram S", contact: "7418436776" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Mangalam", name: "Ajai", contact: "9655070678" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Mangalam", name: "Sridharan", contact: "9442528970" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Villianur", name: "Balachandran B", contact: "9385996339" },
    { zone: "West Zone", zm: "Nizhanth", ac: "Villianur", name: "Arunkumar C", contact: "9159681920" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Karaikal South", name: "Narendran K", contact: "7010997058" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Karaikal South", name: "Arunagiri S", contact: "9342155972" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Thirunallar", name: "Suvedha S", contact: "9894545455" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Thirunallar", name: "Raguraman R", contact: "8637446604" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Thirunallar", name: "Arun S", contact: "9025624043" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Karaikal North", name: "Mohammed Thahsin H", contact: "8637446604" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Neravy T.R. Pattinam", name: "Harikrishnan M", contact: "9159975040" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Neravy T.R. Pattinam", name: "Nagaibabu P", contact: "7010557878" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Nedungadu", name: "Prabhaharan R", contact: "9944862417" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Nedungadu", name: "Antony Raj", contact: "8754357750" },
    { zone: "Karaikal Zone", zm: "Padmashri", ac: "Nedungadu", name: "Madhana Gopal", contact: "6381950637" },
    { zone: "Central Zone", zm: "Shifana", ac: "Kadirgamam", name: "Dinesh", contact: "9080050594" },
    { zone: "Central Zone", zm: "Shifana", ac: "Kadirgamam", name: "Dhakshavelan K", contact: "9751234822" },
    { zone: "Central Zone", zm: "Shifana", ac: "Muthialpet", name: "Karthik( paavadairrayan)", contact: "9043231778" },
    { zone: "Central Zone", zm: "Shifana", ac: "Muthialpet", name: "Seetha R", contact: "9344872384" },
    { zone: "Central Zone", zm: "Shifana", ac: "Ozhukarai", name: "Vidhya", contact: "9342529961" },
    { zone: "Central Zone", zm: "Shifana", ac: "Ozhukarai", name: "Revin", contact: "7548883007" },
    { zone: "Central Zone", zm: "Shifana", ac: "Indira nagar", name: "Selladurai. S", contact: "9943309966" },
    { zone: "Central Zone", zm: "Shifana", ac: "Indira nagar", name: "Saravanan", contact: "9597895463" },
    { zone: "Central Zone", zm: "Shifana", ac: "Indira nagar", name: "Karthik S", contact: "9092324121" },
    { zone: "Central Zone", zm: "Shifana", ac: "Indira nagar", name: "Gokul", contact: "8248463644" },
    { zone: "Central Zone", zm: "Shifana", ac: "Thattanchavady", name: "Prabhu", contact: "8248195576" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Kalapet", name: "Vinoth", contact: "9150631703" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Kalapet", name: "Karthick D", contact: "9626055206" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Mudaliyarpet", name: "Kumaresh", contact: "7867851864" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Mudaliyarpet", name: "Rajadurai", contact: "8098377221" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Mudaliyarpet", name: "Senthurapandiyan. V", contact: "9342134676" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Lawspet", name: "Kishore Kumar.R", contact: "9944061874" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Lawspet", name: "Vishwa.V", contact: "8681839255" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Lawspet", name: "Karthikeyan", contact: "9566474686" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Lawspet", name: "Vinothini", contact: "8428139656" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Nellithope", name: "Rajadurai D", contact: "7695885686" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Kamarajar Nagar", name: "Dhinesh Kumar.S", contact: "7339626428" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Kamarajar Nagar", name: "Ram Kumar P", contact: "9361924258" },
    { zone: "North Zone", zm: "Saaminathan", ac: "Kamaraj Nagar", name: "Pravin Raj", contact: "8220929994" },
    { zone: "South Zone", zm: "Kiri", ac: "Bahour", name: "Natpu Arasan", contact: "8754357750" },
    { zone: "South Zone", zm: "Kiri", ac: "Bahour", name: "Akbar Ali.H", contact: "9047815599" },
    { zone: "South Zone", zm: "Kiri", ac: "Bahour", name: "Anbu Arasan", contact: "860857632" },
    { zone: "South Zone", zm: "Kiri", ac: "Nettapakkam", name: "Selambouli. V", contact: "8807672683" },
    { zone: "South Zone", zm: "Kiri", ac: "Nettapakkam", name: "Hari Krishnan", contact: "8760880657" },
    { zone: "South Zone", zm: "Kiri", ac: "Manavely", name: "Manish M", contact: "7868827087" },
    { zone: "South Zone", zm: "Kiri", ac: "Manavely", name: "Iniyavan K", contact: "9080601459" },
    { zone: "South Zone", zm: "Kiri", ac: "Manavely", name: "Yuvaraj R", contact: "9003988646" },
    { zone: "South Zone", zm: "Kiri", ac: "Embalam", name: "Suresh Kumar K", contact: "9786554560" },
    { zone: "South Zone", zm: "Kiri", ac: "Ariyankuppam", name: "Senthil Kumar R", contact: "9600265696" },
    { zone: "East Zone", zm: "Padmashri / Akbar", ac: "Raj Bhavan", name: "Akbar Ali.H", contact: "9578215417" },
    { zone: "East Zone", zm: "Padmashri / Akbar", ac: "Raj Bhavan", name: "Hariharan V", contact: "8807686411" },
    { zone: "East Zone", zm: "Padmashri / Akbar", ac: "Oupalam", name: "Premkumar. N", contact: "9363590573" },
    { zone: "East Zone", zm: "Padmashri / Akbar", ac: "Oupalam", name: "Manikandan N", contact: "9025116525" },
    { zone: "East Zone", zm: "Padmashri / Akbar", ac: "Orleanpeth", name: "Suresh Kumar S", contact: "9585328987" }
];

// Zonal Managers
const zonalManagers = [
    { name: "Nizhanth", zone: "West Zone", phone: "9999999991" },
    { name: "Padmashri", zone: "Karaikal Zone", phone: "9999999992" },
    { name: "Shifana", zone: "Central Zone", phone: "9999999993" },
    { name: "Saaminathan", zone: "North Zone", phone: "9999999994" },
    { name: "Kiri", zone: "South Zone", phone: "9999999995" },
    { name: "Akbar", zone: "East Zone", phone: "9999999996" }
];

function normalizeNameForMatch(name) {
    return name.toLowerCase()
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

async function importFOAData() {
    try {
        console.log('📋 Importing FOA data and organizing team structure...\n');

        // Get existing employees
        const empSnapshot = await getDocs(collection(db, 'employees'));
        const existingEmployees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`👥 Found ${existingEmployees.length} existing employees`);

        let batch = writeBatch(db);
        let batchCount = 0;

        // Step 1: Add/Update Zonal Managers
        console.log('\n👔 Adding Zonal Managers...');
        const zmIds = {};

        for (const zm of zonalManagers) {
            // Check if ZM already exists
            const existing = existingEmployees.find(emp =>
                normalizeNameForMatch(emp.name).includes(normalizeNameForMatch(zm.name))
            );

            const zmId = existing ? existing.id : `zm-${zm.name.toLowerCase().replace(/\s+/g, '-')}`;
            zmIds[zm.zone] = zmId;

            const zmRef = doc(db, 'employees', zmId);
            await setDoc(zmRef, {
                id: zmId,
                name: zm.name,
                position: 'Zonal Manager (ZM)',
                department: zm.zone,
                email: `${zm.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                phone: zm.phone,
                joiningDate: '2025-01-01',
                status: 'ACTIVE',
                salary_structure: {
                    basic: 35000,
                    hra: 10000,
                    allowances: 5000
                },
                shift: {
                    start: '09:00',
                    end: '18:00'
                }
            }, { merge: true });

            console.log(`✅ ${zm.name} → ${zm.zone}`);
        }

        // Step 2: Process FOAs
        console.log('\n👷 Processing Field Operation Agents...');
        let matchedCount = 0;
        let newCount = 0;

        const stats = {
            'West Zone': 0,
            'Karaikal Zone': 0,
            'Central Zone': 0,
            'North Zone': 0,
            'South Zone': 0,
            'East Zone': 0
        };

        for (const foa of foaData) {
            // Try to match with existing employee
            const normalizedFOAName = normalizeNameForMatch(foa.name);
            const existing = existingEmployees.find(emp => {
                const empName = normalizeNameForMatch(emp.name);
                // Match if names are similar
                return empName.includes(normalizedFOAName.split(' ')[0]) ||
                    normalizedFOAName.includes(empName.split(' ')[0]);
            });

            const foaId = existing ? existing.id : `foa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const managerId = zmIds[foa.zone];

            const foaRef = doc(db, 'employees', foaId);
            batch.set(foaRef, {
                id: foaId,
                name: foa.name,
                position: 'Field Operation Agent (FOA)',
                department: foa.zone,
                assemblyArea: foa.ac,
                manager: managerId,
                email: existing?.email || `${foa.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
                phone: foa.contact,
                joiningDate: existing?.joiningDate || '2025-01-01',
                status: 'ACTIVE',
                salary_structure: existing?.salary_structure || {
                    basic: 25000,
                    hra: 7000,
                    allowances: 3000
                },
                shift: existing?.shift || {
                    start: '09:00',
                    end: '18:00'
                }
            }, { merge: true });

            stats[foa.zone]++;
            batchCount++;

            if (existing) {
                matchedCount++;
                console.log(`🔄 Updated: ${foa.name} → ${foa.zone} (${foa.ac})`);
            } else {
                newCount++;
                console.log(`➕ Added: ${foa.name} → ${foa.zone} (${foa.ac})`);
            }

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`💾 Committed batch`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Team structure import complete!');
        console.log(`\n📊 Summary:`);
        console.log(`   👔 Zonal Managers: ${zonalManagers.length}`);
        console.log(`   👷 Total FOAs: ${foaData.length}`);
        console.log(`   🔄 Matched existing: ${matchedCount}`);
        console.log(`   ➕ Added new: ${newCount}`);
        console.log(`\n📁 Distribution by Zone:`);
        Object.entries(stats).forEach(([zone, count]) => {
            console.log(`   - ${zone}: ${count} FOAs`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

importFOAData();
