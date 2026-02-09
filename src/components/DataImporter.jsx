import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, writeBatch } from 'firebase/firestore';

const DataImporter = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'
    const [message, setMessage] = useState('');
    const [seeding, setSeeding] = useState(false);

    const downloadSample = () => {
        const data = [
            { ID: 'EMP001', Name: 'John Doe', Position: 'Software Engineer', Department: 'Engineering', Email: 'john@example.com' },
            { ID: 'EMP002', Name: 'Jane Smith', Position: 'Product Manager', Department: 'Product', Email: 'jane@example.com' }
        ];
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sample Employees");
        XLSX.writeFile(wb, "employee_sample.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setStatus(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const bstr = event.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (data.length === 0) {
                    throw new Error('No data found in the Excel file.');
                }

                const batch = writeBatch(db);

                data.forEach((item, index) => {
                    const id = (item.ID || item.id || `emp-${index}`).toString();
                    const empRef = doc(db, 'employees', id);
                    batch.set(empRef, {
                        id: id,
                        name: item.Name || item.name || 'Unknown',
                        position: item.Position || item.position || 'Employee',
                        department: item.Department || item.department || 'General',
                        email: item.Email || item.email || '',
                        joiningDate: item['Joining Date'] || item.joiningDate || new Date().toISOString().split('T')[0],
                        status: 'ACTIVE'
                    }, { merge: true });
                });

                await batch.commit();

                setStatus('success');
                setMessage(`Successfully imported ${data.length} employees to cloud.`);
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

    const handleSeedStressData = async () => {
        if (!window.confirm("This will add 1000 dummy employees to Firestore. Proceed?")) return;
        setSeeding(true);
        setStatus(null);
        setMessage('Generating 1000 records...');

        try {
            const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations'];
            const batchSize = 500;
            let currentBatch = writeBatch(db);
            let count = 0;

            for (let i = 1; i <= 1000; i++) {
                const id = `STRESS-${i}`;
                const empRef = doc(db, 'employees', id);

                const dummyEmp = {
                    id,
                    name: `Employee ${i}`,
                    email: `emp${i}@example.com`,
                    phone: `999000${i.toString().padStart(4, '0')}`,
                    department: departments[Math.floor(Math.random() * departments.length)],
                    status: 'Active',
                    joiningDate: new Date().toISOString().split('T')[0],
                    salary_structure: {
                        basic: 25000 + Math.floor(Math.random() * 50000),
                        hra: 10000 + Math.floor(Math.random() * 20000),
                        allowances: 5000 + Math.floor(Math.random() * 10000)
                    },
                    shift: {
                        start: '09:00',
                        end: '18:00'
                    }
                };

                currentBatch.set(empRef, dummyEmp, { merge: true });
                count++;

                if (count % batchSize === 0 || i === 1000) {
                    await currentBatch.commit();
                    currentBatch = writeBatch(db);
                    setMessage(`Seeded ${i}/1000 employees...`);
                }
            }
            setStatus('success');
            setMessage('Stress test data seeded successfully!');
            alert("1000 employees seeded. Check the Directory and Payroll for performance.");
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage('Stress testing failed: ' + err.message);
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
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

            <h2 style={{ marginBottom: '0.5rem' }}>Upload Employee List</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Import your employees using an Excel (.xlsx) or CSV file.<br />
                <button
                    onClick={downloadSample}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}
                >
                    Download sample file
                </button>
            </p>

            <label className="glass" style={{
                display: 'block',
                padding: '1.5rem',
                border: '1px dashed var(--accent)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.05)'
            }}>
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    disabled={loading || seeding}
                />
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Processing...</span>
                    </div>
                ) : (
                    <div>
                        <p style={{ fontWeight: 600, color: 'var(--accent)' }}>Click to browse or drag and drop</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>XLSX, XLS, or CSV (max 10MB)</p>
                    </div>
                )}
            </label>

            {status && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: status === 'success' ? 'var(--success)' : 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    justifyContent: 'center'
                }}>
                    {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span>{message}</span>
                </div>
            )}

            <button
                onClick={handleSeedStressData}
                disabled={loading || seeding}
                style={{
                    marginTop: '3rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    opacity: 0.5,
                    textDecoration: 'underline'
                }}
            >
                [Dev Only] Seed 1,000 Dummy Employees for Stress Test
            </button>
        </div>
    );
};

export default DataImporter;
