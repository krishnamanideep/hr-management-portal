// Check Excel file structure
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

try {
    console.log('📖 Reading attendance.xlsx...');
    const fileBuffer = readFileSync('./public/attendance.xlsx');
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });

    console.log('\n📊 Available sheets:');
    wb.SheetNames.forEach((name, idx) => {
        console.log(`   ${idx + 1}. "${name}"`);
        const ws = wb.Sheets[name];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        console.log(`      - Rows: ${data.length}`);
        if (data.length > 0) {
            console.log(`      - Columns: ${data[0].join(', ')}`);
        }
    });
} catch (error) {
    console.error('❌ Error:', error.message);
}
