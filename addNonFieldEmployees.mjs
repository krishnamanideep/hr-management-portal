// Add Core, Campaign, Influencer, and Former Field Team employees (no attendance)
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

// Employees without attendance tracking
const nonFieldEmployees = [
    // Core Team
    { name: "Pranay", position: "Core Team", department: "Core", phone: "9999999997", email: "pranay@company.com" },

    // Campaign Team
    { name: "Yasasvi Talvar", position: "Campaign Team", department: "Campaign", phone: "9999999998", email: "yasasvi.talvar@company.com" },
    { name: "Dev Kumar", position: "Campaign Team", department: "Campaign", phone: "9999999999", email: "dev.kumar@company.com" },
    { name: "Ajeeth", position: "Campaign Team", department: "Campaign", phone: "9999999900", email: "ajeeth@company.com" },
    { name: "Ramcharan", position: "Campaign Team", department: "Campaign", phone: "9999999901", email: "ramcharan@company.com" },

    // Former Field Team (Left)
    { name: "Vetrivela", position: "Field Team (Left)", department: "Former Employees", phone: "9999999902", email: "vetrivela@company.com", status: "INACTIVE" },
    { name: "Shribhala", position: "Field Team (Left)", department: "Former Employees", phone: "9999999903", email: "shribhala@company.com", status: "INACTIVE" },

    // Influencers (from screenshot - sample, add more as needed)
    { name: "K Magesh", position: "Influencer", department: "Influencers", phone: "9994958222", email: "k.magesh@company.com", instagram: "Tee Prabu Clubs" },
    { name: "Shajesh S", position: "Influencer", department: "Influencers", phone: "9597242955", email: "shajesh@company.com", instagram: "Ps_31_yt_info" },
    { name: "M Arun", position: "Influencer", department: "Influencers", phone: "9486350299", email: "m.arun@company.com", instagram: "Random Guy Py" },
    { name: "Vigneswaran", position: "Influencer", department: "Influencers", phone: "9445155282", email: "vigneswaran@company.com", instagram: "Vignesh__vlogger" },
    { name: "R MAGESH KUMAR", position: "Influencer", department: "Influencers", phone: "9344063082", email: "r.magesh@company.com", instagram: "Follow up ashwin" },
    { name: "Santhosh", position: "Influencer", department: "Influencers", phone: "9047895382", email: "santhosh@company.com", instagram: "Pondicherry_ Presents" },
    { name: "Lokesh", position: "Influencer", department: "Influencers", phone: "7904083651", email: "lokesh@company.com", instagram: "_theLokii_ing" },
    { name: "Sura Gopan", position: "Influencer", department: "Influencers", phone: "6374083385", email: "sura.gopan@company.com", instagram: "Aadava_vlogi" },
    { name: "Karthick", position: "Influencer", department: "Influencers", phone: "9487832181", email: "karthick.inf@company.com", instagram: "Tamilanda_vlogs" },
    { name: "Akhilesh", position: "Influencer", department: "Influencers", phone: "8940581-01", email: "akhilesh@company.com", instagram: "House of swirly" },
    { name: "Manikandan P", position: "Influencer", department: "Influencers", phone: "9790093341", email: "manikandan.p@company.com", instagram: "Rogue Follower Py" },
    { name: "Saran", position: "Influencer", department: "Influencers", phone: "9943652200", email: "saran@company.com", instagram: "Straight_journey" },
    { name: "A PRASANTH", position: "Influencer", department: "Influencers", phone: "9677513991", email: "a.prasanth@company.com", instagram: "Pondicherry_ Presents" },
    { name: "Keshav", position: "Influencer", department: "Influencers", phone: "9087702703", email: "keshav@company.com", instagram: "Boy_vitta_vlog_" },
    { name: "Sahul V", position: "Influencer", department: "Influencers", phone: "8124218103", email: "sahul.v@company.com", instagram: "Kachava (column)" },
    { name: "Akash", position: "Influencer", department: "Influencers", phone: "9787789925", email: "akash.inf@company.com", instagram: "UK info Boy" },
    { name: "Ashwin", position: "Influencer", department: "Influencers", phone: "9047895382", email: "ashwin@company.com", instagram: "Pondy Geekers" },
    { name: "Jhonny", position: "Influencer", department: "Influencers", phone: "9360108793", email: "jhonny@company.com", instagram: "Villgeram Vlogz/ Mani" },
    { name: "Kavi", position: "Influencer", department: "Influencers", phone: "6369970564", email: "kavi@company.com", instagram: "Kavi Vlogger" },
    { name: "Haroon", position: "Influencer", department: "Influencers", phone: "9994852384", email: "haroon@company.com", instagram: "Haroon_vlogs" },
    { name: "Lallu", position: "Influencer", department: "Influencers", phone: "9597076325", email: "lallu@company.com", instagram: "Broken no cougar" },
    { name: "Pir Saheed", position: "Influencer", department: "Influencers", phone: "9047817902", email: "pir.saheed@company.com", instagram: "sk_vithil_official" },
    { name: "Kamalahasan", position: "Influencer", department: "Influencers", phone: "7904522605", email: "kamalahasan@company.com", instagram: "Kamalahasan_vlogs" },
    { name: "Navin", position: "Influencer", department: "Influencers", phone: "9677946677", email: "navin@company.com", instagram: "sr Prabu" },
    { name: "Senthoor", position: "Influencer", department: "Influencers", phone: "9597014975", email: "senthoor@company.com", instagram: "Minty Nest" },
    { name: "Suganthan", position: "Influencer", department: "Influencers", phone: "7904522605", email: "suganthan@company.com", instagram: "Pondicherry Spot Daily" },
    { name: "Santhosh", position: "Influencer", department: "Influencers", phone: "7502713885", email: "santhosh.s@company.com", instagram: "Harsha_pondy" },
    { name: "Santhosh", position: "Influencer", department: "Influencers", phone: "9361196034", email: "santhosh.inf2@company.com", instagram: "Santhosh_vimal_" },
    { name: "Aakash", position: "Influencer", department: "Influencers", phone: "9361196034", email: "aakash@company.com", instagram: "Vegitable life" }
];

async function addNonFieldEmployees() {
    try {
        console.log('👥 Adding Core, Campaign, Influencer, and Former employees...\n');

        let addedCount = 0;

        for (const emp of nonFieldEmployees) {
            const empId = `emp-${emp.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

            const empRef = doc(db, 'employees', empId);
            await setDoc(empRef, {
                id: empId,
                name: emp.name,
                position: emp.position,
                department: emp.department,
                email: emp.email,
                phone: emp.phone,
                instagram: emp.instagram || '',
                joiningDate: '2025-01-01',
                status: emp.status || 'ACTIVE',
                salary_structure: {
                    basic: 0,
                    hra: 0,
                    allowances: 0
                },
                shift: {
                    start: '09:00',
                    end: '18:00'
                },
                attendanceTracking: false // Flag to indicate no attendance tracking
            });

            addedCount++;
            console.log(`✅ ${emp.name} → ${emp.department} (${emp.position})`);
        }

        console.log('\n✅ Non-field employees added!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Total added: ${addedCount}`);
        console.log(`   - Core Team: 1`);
        console.log(`   - Campaign Team: 4`);
        console.log(`   - Former Employees: 2`);
        console.log(`   - Influencers: ${addedCount - 7}`);
        console.log(`\n⚠️  Note: These employees will NOT have attendance tracking`);
        console.log(`   They will appear in employee charts and lists only.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addNonFieldEmployees();
