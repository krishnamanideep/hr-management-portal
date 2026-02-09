import React, { useState } from 'react';
import { Search, Trash2, Mail, Building2, Briefcase, Phone, X, Edit2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const id = `EMP${Date.now()}`;
        const employee = { ...newEmployee, id, status: 'ACTIVE' };
        try {
            await setDoc(doc(db, 'employees', id), employee);
            await logAudit('EMPLOYEE_CREATE', `Added new employee: ${employee.name}`, { before: null, after: employee });
            setIsAdding(false);
            setNewEmployee({
                name: '', position: '', department: '', email: '', phone: '', status: 'ACTIVE',
                joiningDate: new Date().toISOString().split('T')[0],
                salary_structure: { basic: 0, hra: 0, allowances: 0 },
                shift: { start: '09:00', end: '18:00' }
            });
        } catch (err) {
            console.error(err);
            alert("Failed to add employee.");
        }
    };

    const saveEmployee = async (e) => {
        e.preventDefault();
        const before = employees.find(emp => emp.id === editingEmployee.id);
        try {
            await setDoc(doc(db, 'employees', editingEmployee.id), editingEmployee);
            await logAudit('EMPLOYEE_UPDATE', `Updated employee: ${editingEmployee.name}`, { before, after: editingEmployee });
            setEditingEmployee(null);
        } catch (err) {
            console.error(err);
            alert("Failed to save changes.");
        }
    };

    const deleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee?')) {
            const before = employees.find(emp => emp.id === id);
            try {
                await deleteDoc(doc(db, 'employees', id));
                await logAudit('EMPLOYEE_DELETE', `Removed employee: ${before?.name || id}`, { before, after: null });
            } catch (err) {
                console.error(err);
                alert("Failed to delete employee.");
            }
        }
    };

    const EmployeeModal = ({ title, data, setData, onSubmit, onClose, buttonText }) => (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
        }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-card"
                style={{
                    width: '100%', maxWidth: '600px', background: 'white',
                    maxHeight: '90vh', overflowY: 'auto', padding: '2rem'
                }}
            >
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Full Name *
                            </label>
                            <input
                                required
                                className="glass-input"
                                value={data.name || ''}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Position *
                            </label>
                            <input
                                required
                                className="glass-input"
                                value={data.position || ''}
                                onChange={(e) => setData({ ...data, position: e.target.value })}
                                placeholder="e.g. Software Engineer"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Department *
                            </label>
                            <input
                                required
                                className="glass-input"
                                value={data.department || ''}
                                onChange={(e) => setData({ ...data, department: e.target.value })}
                                placeholder="e.g. Engineering"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                className="glass-input"
                                value={data.email || ''}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Phone
                            </label>
                            <input
                                className="glass-input"
                                value={data.phone || ''}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button type="button" onClick={onClose} className="btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {buttonText}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="glass" style={{
                    display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                    background: 'white', flex: 1, maxWidth: '400px'
                }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: 'none', background: 'transparent', marginLeft: '0.75rem',
                            flex: 1, outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)'
                        }}
                    />
                </div>
                <button onClick={() => setIsAdding(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} />
                    Add Employee
                </button>
            </div>

            {/* Employee Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredEmployees.map((emp) => (
                    <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative'
                        }}
                    >
                        {/* Avatar & Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '1.25rem', fontWeight: 700
                            }}>
                                {emp.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {emp.name || 'Unknown'}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {emp.position || 'No Position'}
                                </p>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <Building2 size={16} />
                                <span>{emp.department || 'No Department'}</span>
                            </div>
                            {emp.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Mail size={16} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {emp.email}
                                    </span>
                                </div>
                            )}
                            {emp.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Phone size={16} />
                                    <span>{emp.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* Status & Actions */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)'
                        }}>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                background: emp.status === 'ACTIVE' ? 'var(--success-light)' : 'var(--danger-light)',
                                color: emp.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {emp.status || 'ACTIVE'}
                            </span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setEditingEmployee(emp)}
                                    className="btn-ghost"
                                    style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteEmployee(emp.id)}
                                    className="btn-ghost"
                                    style={{ padding: '0.5rem', color: 'var(--danger)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAdding && (
                    <EmployeeModal
                        title="Add New Employee"
                        data={newEmployee}
                        setData={setNewEmployee}
                        onSubmit={handleAddEmployee}
                        onClose={() => setIsAdding(false)}
                        buttonText="Add Employee"
                    />
                )}
                {editingEmployee && (
                    <EmployeeModal
                        title="Edit Employee"
                        data={editingEmployee}
                        setData={setEditingEmployee}
                        onSubmit={saveEmployee}
                        onClose={() => setEditingEmployee(null)}
                        buttonText="Save Changes"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeList;
