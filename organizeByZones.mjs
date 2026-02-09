// Assign FOAs to their Zonal Managers and organize by zones
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

// Zone to assembly area mapping
const zoneAssignments = {
    'West Zone': {
        manager: 'Nizhanth',
        assemblies: ['mannadipet', 'ossudu', 'oussudu', 'thirubhuvanai', 'thirubuvanai']
    },
    'Karaikal Zone': {
        manager: 'Padmashri',
        assemblies: ['karaikal', 'thirunallar', 'neravy', 'nedungadu', 'mangalam', 'villianur']
    },
    'Central Zone': {
        manager: 'Shifana',
        assemblies: ['kadirgamam', 'kadirkamam', 'muthialpet', 'muthaiyalpet', 'ozhukarai', 'ozhukkarai', 'indira nagar', 'indiranagar', 'thattanchavady']
    },
    'North Zone': {
        manager: 'Saaminathan',
        assemblies: ['kalapet', 'lawspet', 'mudaliyarpet', 'mudaliarpet', 'nellithope', 'kamaraj nagar', 'orleanpeth', 'oupalam']
    },
    'South Zone': {
        manager: 'Kiri',
        assemblies: ['bahour', 'nettapakkam', 'nettapakkalam', 'manavely', 'manavaely', 'embalam', 'ariyankuppam', 'raj bhavan']
    },
    'East Zone': {
        manager: 'Akbar',
        assemblies: ['lawyet', 'oogalam', 'orleanpeth']
    }
};

function getZoneFromPosition(position) {
    const posLower = (position || '').toLowerCase();

    for (const [zone, data] of Object.entries(zoneAssignments)) {
        if (data.assemblies.some(assembly => posLower.includes(assembly))) {
            return { zone, manager: data.manager };
        }
    }

    return null;
}

async function organizeByZones() {
    try {
        console.log('🗂️  Organizing employees by zones and assigning managers...');

        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`👥 Found ${employees.length} employees`);

        // First, find all Zonal Managers
        const zonalManagers = {};
        employees.forEach(emp => {
            if (emp.position === 'Zonal Manager (ZM)') {
                zonalManagers[emp.department] = emp.id;
                console.log(`👔 Found ZM: ${emp.name} (${emp.department}) - ID: ${emp.id}`);
            }
        });

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedCount = 0;

        const stats = {
            'West Zone': 0,
            'Karaikal Zone': 0,
            'Central Zone': 0,
            'North Zone': 0,
            'South Zone': 0,
            'East Zone': 0,
            'Unassigned': 0
        };

        for (const emp of employees) {
            // Skip if already a Zonal Manager
            if (emp.position === 'Zonal Manager (ZM)') continue;

            // Determine zone from position/assembly
            const zoneInfo = getZoneFromPosition(emp.position);

            if (zoneInfo) {
                const { zone, manager } = zoneInfo;
                const managerId = zonalManagers[zone];

                const empRef = doc(db, 'employees', emp.id);
                const updateData = {
                    position: 'Field Operation Agent (FOA)',
                    department: zone
                };

                // Add manager reference if manager exists
                if (managerId) {
                    updateData.manager = managerId;
                }

                batch.update(empRef, updateData);

                stats[zone]++;
                updatedCount++;
                batchCount++;

                console.log(`✅ ${emp.name} → ${zone} (Manager: ${manager})`);
            } else {
                // Unassigned - keep as Field Operations
                const empRef = doc(db, 'employees', emp.id);
                batch.update(empRef, {
                    position: 'Field Operation Agent (FOA)',
                    department: 'Field Operations'
                });

                stats['Unassigned']++;
                updatedCount++;
                batchCount++;

                console.log(`⚠️  ${emp.name} → Unassigned (Field Operations)`);
            }

            if (batchCount >= 400) {
                await batch.commit();
                console.log(`💾 Committed batch (${updatedCount} employees processed)`);
                batch = writeBatch(db);
                batchCount = 0;
            }
        }

        if (batchCount > 0) {
            await batch.commit();
        }

        console.log('\n✅ Organization complete!');
        console.log(`\n📊 Summary by Zone:`);
        Object.entries(stats).forEach(([zone, count]) => {
            if (count > 0) {
                console.log(`   - ${zone}: ${count} FOAs`);
            }
        });
        console.log(`\n👔 Zonal Managers: ${Object.keys(zonalManagers).length}`);
        console.log(`👥 Total FOAs: ${updatedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

organizeByZones();
