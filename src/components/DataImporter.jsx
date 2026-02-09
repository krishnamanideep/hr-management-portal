import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { db } from '../firebase';
import { doc, writeBatch } from 'firebase/firestore';

const DataImporter = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'
    const [message, setMessage] = useState('');
    const [seeding, setSeeding] = useState(false);

    const downloadSample = () => {
        // Emp Sheet
        const empData = [
            {
                ID: 'EMP001',
                Name: 'John Doe',
                Position: 'Software Engineer',
                Department: 'Engineering',
                Email: 'john@example.com',
                Phone: '9999999999',
                'Joining Date': '2023-01-15',
                'Basic Salary': 50000,
                'HRA': 20000,
                'Allowances': 5000,
                'Shift Start': '09:00',
                'Shift End': '18:00'
            },
            {
                ID: 'EMP002',
                Name: 'Jane Smith',
                Position: 'Product Manager',
                Department: 'Product',
                Email: 'jane@example.com',
                Phone: '8888888888',
                'Joining Date': '2023-02-01',
                'Basic Salary': 60000,
                'HRA': 25000,
                'Allowances': 8000,
                'Shift Start': '10:00',
                'Shift End': '19:00'
            }
        ];

        // Attendance Sheet (Sample - Date based)
        const attData = [
            { Date: '2023-10-01', 'EMP001': 'P', 'EMP002': 'A' },
            { Date: '2023-10-02', 'EMP001': 'P', 'EMP002': 'P' }
        ];

        const wb = XLSX.utils.book_new();
        const wsEmp = XLSX.utils.json_to_sheet(empData);
        const wsAtt = XLSX.utils.json_to_sheet(attData);

        XLSX.utils.book_append_sheet(wb, wsEmp, "Employees");
        XLSX.utils.book_append_sheet(wb, wsAtt, "Attendance");
        XLSX.writeFile(wb, "employee_import_template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setStatus(null);
        setMessage('Parsing file...');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const bstr = event.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });

                // 1. Parse Employees
                const empSheetName = wb.SheetNames.find(n => n.toLowerCase().includes('employee') || n.toLowerCase().includes('staff') || n.toLowerCase().includes('data')) || wb.SheetNames[0];
                const empWs = wb.Sheets[empSheetName];
                const empData = XLSX.utils.sheet_to_json(empWs);

                if (empData.length === 0) throw new Error('No employee data found.');

                const batch = writeBatch(db);
                let empCount = 0;

                empData.forEach((item, index) => {
                    // Try to find fields with various casing
                    const getField = (row, ...keys) => {
                        for (const k of keys) {
                            const found = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
                            if (found) return row[found];
                        }
                        return null;
                    };

                    const id = (getField(item, 'id', 'emp id', 'empid') || `gen-emp-${Date.now()}-${index}`).toString();
                    const name = getField(item, 'name', 'full name', 'employee name') || 'Unknown';

                    if (name === 'Unknown') return; // Skip empty rows

                    const empRef = doc(db, 'employees', id);
                    batch.set(empRef, {
                        id: id,
                        name: name,
                        position: getField(item, 'position', 'role', 'job title') || 'Employee',
                        department: getField(item, 'department', 'dept') || 'General',
                        email: getField(item, 'email', 'e-mail') || '',
                        phone: getField(item, 'phone', 'mobile', 'contact') || '',
                        joiningDate: getField(item, 'joining date', 'date of joining', 'doj') || new Date().toISOString().split('T')[0],
                        status: 'ACTIVE',
                        salary_structure: {
                            basic: Number(getField(item, 'basic', 'basic salary') || 0),
                            hra: Number(getField(item, 'hra', 'house rent allowance') || 0),
                            allowances: Number(getField(item, 'allowances', 'special allowance', 'bonus') || 0)
                        },
                        shift: {
                            start: getField(item, 'shift start', 'start time') || '09:00',
                            end: getField(item, 'shift end', 'end time') || '18:00'
                        }
                    }, { merge: true });
                    empCount++;
                });

                // 2. Parse Attendance (Optional)
                const attSheetName = wb.SheetNames.find(n => n.toLowerCase().includes('attendance') || n.toLowerCase().includes('log'));
                let attCount = 0;

                if (attSheetName) {
                    const attWs = wb.Sheets[attSheetName];
                    const attData = XLSX.utils.sheet_to_json(attWs);

                    // Group by Date for efficient Firestore writes
                    const attByDate = {}; // { '2023-10-01': [id1, id2] }

                    attData.forEach(row => {
                        // Assuming Row format: Date | Emp1 | Emp2 ... OR Date | ID | Status
                        // Let's support the Template format: Date column key + Employee ID keys

                        const dateRaw = getField(row, 'date', 'day');
                        if (!dateRaw) return;

                        // Try to parse excel date or string date
                        let dateStr;
                        if (typeof dateRaw === 'number') {
                            // Excel serial date
                            dateStr = new Date(Math.round((dateRaw - 25569) * 86400 * 1000)).toISOString().split('T')[0];
                        } else {
                            // Try parse string
                            const d = new Date(dateRaw);
                            if (!isNaN(d)) dateStr = d.toISOString().split('T')[0];
                            else dateStr = String(dateRaw); // Fallback
                        }

                        if (!attByDate[dateStr]) attByDate[dateStr] = [];

                        // Iterate keys to find Employee IDs marked as 'P' or 'Present'
                        Object.keys(row).forEach(key => {
                            if (key.toLowerCase() === 'date') return;
                            const val = row[key]?.toString().toLowerCase().trim();
                            if (val === 'p' || val === 'present') {
                                // The key is the Employee ID
                                attByDate[dateStr].push(key);
                            }
                        });
                    });

                    // Commit Attendance
                    for (const [date, presentIds] of Object.entries(attByDate)) {
                        const attRef = doc(db, 'attendance', date);
                        // We use set with merge: true, but for arrays union might be safer if not overwriting.
                        // However, import usually implies "state of truth". Let's overwrite for that date.
                        batch.set(attRef, { presentIds }, { merge: true });
                        attCount++;
                    }
                }

                await batch.commit();

                setStatus('success');
                setMessage(`Imported ${empCount} employees${attCount > 0 ? ` and attendance for ${attCount} days` : ''}.`);
            } catch (err) {
                console.error(err);
                setStatus('error');
                setMessage(err.message || 'Failed to parse Excel file.');
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setStatus('error');
            setMessage('Error reading file.');
            setLoading(false);
        };

        reader.readAsBinaryString(file);
    };

    // ... (keep handleSeedStressData generic logic if needed, or remove to clean up. I'll remove for cleaner code in this replacement, keeping it focused on the Excel requirement)

    const getField = (row, ...keys) => {
        for (const k of keys) {
            const found = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
            if (found) return row[found];
        }
        return null;
    };

    return (
        <div className="glass-card fade-in" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '2px dashed var(--glass-border)'
            }}>
                <FileUp size={32} color="var(--accent)" />
            </div>

            <h2 style={{ marginBottom: '0.5rem' }}>Import Data</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Upload an Excel file to bulk import employees and attendance.<br />
                <button
                    onClick={downloadSample}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontWeight: 500 }}
                >
                    <Download size={14} /> Download Template
                </button>
                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={handleSeedAttendance}
                        disabled={loading || seeding}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            opacity: 0.5,
                            textDecoration: 'underline'
                        }}
                    >
                        [Dev] Seed Jan '26 Attendance
                    </button>
                </div>
            </p>

            <label className="glass" style={{
                display: 'block',
                padding: '2rem',
                border: '2px dashed var(--glass-border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-card)'
            }}>
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={loading}
                />
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Loader2 className="animate-spin" size={24} color="var(--accent)" />
                        <span style={{ color: 'var(--text-muted)' }}>Processing data...</span>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>Click or Drag File Here</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Supports .xlsx, .xls, .csv</p>
                    </div>
                )}
            </label>

            {status && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: status === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                    color: status === 'success' ? 'var(--success)' : 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    fontWeight: 500
                }}>
                    {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{message}</span>
                </div>
            )}
        </div>
    );
};

export default DataImporter;
