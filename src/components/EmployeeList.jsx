import React, { useState } from 'react';
import {
    Search,
    MoreVertical,
    Trash2,
    Mail,
    Building2,
    Briefcase,
    Users,
    Plus,
    Phone,
    X,
    User as UserIcon
} from 'lucide-react';

import { motion } from 'framer-motion';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { logAudit } from '../utils/auditLogger';

const EmployeeList = ({ employees }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        status: 'ACTIVE',
        joiningDate: new Date().toISOString().split('T')[0],
        salary_structure: { basic: 0, hra: 0, allowances: 0 },
        shift: { start: '09:00', end: '18:00' }
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ... (Handlers: handleAddEmployee, saveEmployee, deleteEmployee - kept same logic, just ensure imports are there)
    // Note: In a real refactor I would keep the handlers. For brevity in this replacement I'm focusing on the render return.
    // Re-implementing handlers to be safe since I'm replacing the whole component body mostly.

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const id = `EMP${Date.now()}`;
        const employee = { ...newEmployee, id, status: 'ACTIVE' };
        try {
            await setDoc(doc(db, 'employees', id), employee);
            await logAudit('EMPLOYEE_CREATE', `Added new employee: ${employee.name}`, { before: null, after: employee });
            setIsAdding(false);
            setNewEmployee({ name: '', position: '', department: '', email: '', phone: '', status: 'ACTIVE', joiningDate: new Date().toISOString().split('T')[0], salary_structure: { basic: 0, hra: 0, allowances: 0 }, shift: { start: '09:00', end: '18:00' } });
        } catch (err) { console.error(err); alert("Failed to add employee."); }
    };

    const saveEmployee = async (e) => {
        e.preventDefault();
        const before = employees.find(emp => emp.id === editingEmployee.id);
        try {
            await setDoc(doc(db, 'employees', editingEmployee.id), editingEmployee);
            await logAudit('EMPLOYEE_UPDATE', `Updated employee: ${editingEmployee.name}`, { before, after: editingEmployee });
            setEditingEmployee(null);
        } catch (err) { console.error(err); alert("Failed to save changes."); }
    };

    const deleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            const before = employees.find(emp => emp.id === id);
            try {
                await deleteDoc(doc(db, 'employees', id));
                await logAudit('EMPLOYEE_DELETE', `Removed employee: ${before?.name || id}`, { before, after: null });
            } catch (err) { console.error(err); alert("Failed to delete employee."); }
        }
    };

    const EmployeeModal = ({ title, data, setData, onSubmit, onClose, buttonText }) => (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', background: 'white', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <h3>{title}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        {/* Form Fields - using glass-input class */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                            <input required className="glass-input" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Position</label>
                            <input required className="glass-input" value={data.position} onChange={(e) => setData({ ...data, position: e.target.value })} placeholder="e.g. Software Engineer" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                            <input required className="glass-input" value={data.department} onChange={(e) => setData({ ...data, department: e.target.value })} placeholder="e.g. Engineering" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email</label>
                            <input type="email" className="glass-input" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="john@example.com" />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone</label>
                            <input className="glass-input" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} placeholder="+1 234 567 8900" />
                        </div>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Salary & Shift</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basic</label><input type="number" className="glass-input" value={data.salary_structure?.basic || 0} onChange={(e) => setData({ ...data, salary_structure: { ...(data.salary_structure || {}), basic: Number(e.target.value) } })} /></div>
                            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HRA</label><input type="number" className="glass-input" value={data.salary_structure?.hra || 0} onChange={(e) => setData({ ...data, salary_structure: { ...(data.salary_structure || {}), hra: Number(e.target.value) } })} /></div>
                            <div><label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allowances</label><input type="number" className="glass-input" value={data.salary_structure?.allowances || 0} onChange={(e) => setData({ ...data, salary_structure: { ...(data.salary_structure || {}), allowances: Number(e.target.value) } })} /></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                        <button type="submit" className="btn-primary">{buttonText}</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'white', flex: 1, maxWidth: '400px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', marginLeft: '0.5rem', flex: 1, outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)' }}
                    />
                </div>
                <button onClick={() => setIsAdding(true)} className="btn-primary">
                    <Plus size={20} /> Add Employee
                </button>
            </div>

            {/* Employee Grid */}
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredEmployees.map((emp) => (
                    <motion.div layout key={emp.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div className="avatar-initials" style={{ width: '50px', height: '50px', fontSize: '1.25rem', background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                                    {emp.name?.charAt(0) || <UserIcon />}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{emp.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{emp.position}</span>
                                </div>
                            </div>
                            <button onClick={() => deleteEmployee(emp.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.25rem' }} className="hover:text-danger">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Building2 size={16} /> {emp.department}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} /> {emp.email || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <Phone size={16} /> {emp.phone || 'N/A'}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: emp.status === 'ACTIVE' ? 'var(--success-light)' : 'var(--secondary)', color: emp.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>
                                {emp.status || 'ACTIVE'}
                            </span>
                            <button onClick={() => setEditingEmployee(emp)} className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                Edit Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Modals */}
            {isAdding && <EmployeeModal title="Add New Employee" data={newEmployee} setData={setNewEmployee} onSubmit={handleAddEmployee} onClose={() => setIsAdding(false)} buttonText="Create Employee" />}
            {editingEmployee && <EmployeeModal title="Edit Employee" data={editingEmployee} setData={setEditingEmployee} onSubmit={saveEmployee} onClose={() => setEditingEmployee(null)} buttonText="Save Changes" />}

            {filteredEmployees.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <UsersIcon size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>No employees found.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
