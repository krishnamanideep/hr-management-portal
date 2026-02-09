// Update employees with proper roles and departments based on team structure
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

// Role and department mapping based on position keywords
function getRoleAndDepartment(position, name) {
    const posLower = (position || '').toLowerCase();
    const nameLower = (name || '').toLowerCase();

    // State Lead
    if (posLower.includes('state lead') || posLower.includes('fpi')) {
        return { role: 'State Lead (FPI)', department: 'Leadership' };
    }

    // Zonal Managers
    if (posLower.includes('zonal manager') || posLower.includes('zm')) {
        // Determine zone from position or name
        if (posLower.includes('west') || nameLower.includes('nizhanth')) {
            return { role: 'Zonal Manager (ZM)', department: 'West Zone' };
        }
        if (posLower.includes('karaikal') || nameLower.includes('padmashri')) {
            return { role: 'Zonal Manager (ZM)', department: 'Karaikal Zone' };
        }
        if (posLower.includes('central') || nameLower.includes('shifana')) {
            return { role: 'Zonal Manager (ZM)', department: 'Central Zone' };
        }
        if (posLower.includes('north') || nameLower.includes('saaminathan') || nameLower.includes('saminathan')) {
            return { role: 'Zonal Manager (ZM)', department: 'North Zone' };
        }
        if (posLower.includes('south') || nameLower.includes('kiri')) {
            return { role: 'Zonal Manager (ZM)', department: 'South Zone' };
        }
        if (posLower.includes('east') || nameLower.includes('akbar')) {
            return { role: 'Zonal Manager (ZM)', department: 'East Zone' };
        }
        return { role: 'Zonal Manager (ZM)', department: 'Zone Management' };
    }

    // Field Operation Agents - determine zone by assembly area
    if (posLower.includes('assembly') || posLower.includes('field') || posLower.includes('associate')) {
        // West Zone assemblies
        const westAreas = ['mannadipet', 'ossudu', 'thirubhuvanai', 'mangalam', 'villianur'];
        // Karaikal Zone assemblies
        const karaikalAreas = ['karaikal', 'thirunallar', 'neravy', 'nedungadu', 'oupalam', 'raj bhavan'];
        // Central Zone assemblies
        const centralAreas = ['kadirgamam', 'muthialpet', 'ozhukarai', 'indira nagar', 'thattanchavady'];
        // North Zone assemblies
        const northAreas = ['kalapet', 'lawspet', 'mudaliyarpet', 'nellithope', 'kamaraj nagar', 'orleanpeth'];
        // South Zone assemblies
        const southAreas = ['bahour', 'nettapakkam', 'manavely', 'embalam', 'ariyankuppam'];

        const positionArea = posLower;

        if (westAreas.some(area => positionArea.includes(area))) {
            return { role: 'Field Operation Agent (FOA)', department: 'West Zone' };
        }
        if (karaikalAreas.some(area => positionArea.includes(area))) {
            return { role: 'Field Operation Agent (FOA)', department: 'Karaikal Zone' };
        }
        if (centralAreas.some(area => positionArea.includes(area))) {
            return { role: 'Field Operation Agent (FOA)', department: 'Central Zone' };
        }
        if (northAreas.some(area => positionArea.includes(area))) {
            return { role: 'Field Operation Agent (FOA)', department: 'North Zone' };
        }
        if (southAreas.some(area => positionArea.includes(area))) {
            return { role: 'Field Operation Agent (FOA)', department: 'South Zone' };
        }

        // Default to Field Operations if can't determine zone
        return { role: 'Field Operation Agent (FOA)', department: 'Field Operations' };
    }

    // Default
    return { role: 'Field Operation Agent (FOA)', department: 'Field Operations' };
}

async function updateRolesAndDepartments() {
    try {
        console.log('🔄 Updating employee roles and departments...');

        const empSnapshot = await getDocs(collection(db, 'employees'));
        const employees = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        console.log(`👥 Found ${employees.length} employees`);

        let batch = writeBatch(db);
        let batchCount = 0;
        let updatedCount = 0;

        const stats = {
            'State Lead (FPI)': 0,
            'Zonal Manager (ZM)': 0,
            'Field Operation Agent (FOA)': 0
        };

        for (const emp of employees) {
            const { role, department } = getRoleAndDepartment(emp.position, emp.name);

            const empRef = doc(db, 'employees', emp.id);
            batch.update(empRef, {
                position: role,
                department: department
            });

            stats[role] = (stats[role] || 0) + 1;
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

        console.log('\n✅ Role and department update complete!');
        console.log(`📊 Summary:`);
        console.log(`   - Total employees: ${employees.length}`);
        console.log(`   - State Lead (FPI): ${stats['State Lead (FPI)']}`);
        console.log(`   - Zonal Manager (ZM): ${stats['Zonal Manager (ZM)']}`);
        console.log(`   - Field Operation Agent (FOA): ${stats['Field Operation Agent (FOA)']}`);
        console.log(`\n📁 Departments:`);
        console.log(`   - Leadership`);
        console.log(`   - West Zone, Karaikal Zone, Central Zone, North Zone, South Zone, East Zone`);
        console.log(`   - Field Operations`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateRolesAndDepartments();
