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
        salary_structure: {
            basic: 0,
            hra: 0,
            allowances: 0
        },
        shift: {
            start: '09:00',
            end: '18:00'
        }
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        const id = `EMP${Date.now()}`;
        const employee = {
            ...newEmployee,
            id: id,
            status: 'ACTIVE'
        };

        try {
            await setDoc(doc(db, 'employees', id), employee);
            await logAudit('EMPLOYEE_CREATE', `Added new employee: ${employee.name}`, { before: null, after: employee });
            setIsAdding(false);
            setNewEmployee({
                name: '',
                position: '',
                department: '',
                email: '',
                phone: '',
                joiningDate: new Date().toISOString().split('T')[0],
                present: false
            });
        } catch (err) {
            console.error("Error adding employee:", err);
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
            console.error("Error saving employee:", err);
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
                console.error("Error deleting employee:", err);
                alert("Failed to delete employee.");
            }
        }
    };

    const EmployeeModal = ({ title, data, setData, onSubmit, onClose, buttonText }) => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '500px', background: '#ffffff', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{title}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                            <input
                                required
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)' }}
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Position</label>
                            <input
                                required
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)' }}
                                value={data.position}
                                onChange={(e) => setData({ ...data, position: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Department</label>
                            <input
                                required
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)' }}
                                value={data.department}
                                onChange={(e) => setData({ ...data, department: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email"
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)' }}
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Phone</label>
                            <input
                                className="glass"
                                style={{ width: '100%', padding: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)' }}
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Salary Structure</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Basic</label>
                                    <input
                                        type="number"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                        value={data.salary_structure?.basic}
                                        onChange={(e) => setData({ ...data, salary_structure: { ...data.salary_structure, basic: Number(e.target.value) } })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>HRA</label>
                                    <input
                                        type="number"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                        value={data.salary_structure?.hra}
                                        onChange={(e) => setData({ ...data, salary_structure: { ...data.salary_structure, hra: Number(e.target.value) } })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Allowances</label>
                                    <input
                                        type="number"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                        value={data.salary_structure?.allowances}
                                        onChange={(e) => setData({ ...data, salary_structure: { ...data.salary_structure, allowances: Number(e.target.value) } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Work Shift</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Starts At</label>
                                    <input
                                        type="time"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                        value={data.shift?.start}
                                        onChange={(e) => setData({ ...data, shift: { ...data.shift, start: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Ends At</label>
                                    <input
                                        type="time"
                                        className="glass"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                                        value={data.shift?.end}
                                        onChange={(e) => setData({ ...data, shift: { ...data.shift, end: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="submit"
                            className="glass"
                            style={{ flex: 1, padding: '0.75rem', background: 'var(--accent)', color: 'white', fontWeight: 600 }}
                        >
                            {buttonText}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, background: 'white' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search employees by name, department or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            width: '100%',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="glass"
                    style={{
                        padding: '0.75rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'var(--accent)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            <motion.div
                layout
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
            >
                {filteredEmployees.map((emp) => (
                    <motion.div layout key={emp.id} className="glass-card" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: 'var(--accent-glow)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: 'var(--accent)'
                            }}>
                                {emp.name?.charAt(0) || <UserIcon size={24} />}
                            </div>
                            <button
                                onClick={() => deleteEmployee(emp.id)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{emp.name}</h3>
                        <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>{emp.position}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <Building2 size={16} />
                                <span>{emp.department}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <Mail size={16} />
                                <span>{emp.email || 'No email set'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <Phone size={16} />
                                <span>{emp.phone || 'No phone set'}</span>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                background: emp.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                color: emp.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)',
                                fontWeight: 600
                            }}>
                                {emp.status || 'ACTIVE'}
                            </span>
                            <button
                                onClick={() => setEditingEmployee(emp)}
                                className="glass"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600 }}
                            >
                                Edit Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {isAdding && (
                <EmployeeModal
                    title="Add New Employee"
                    data={newEmployee}
                    setData={setNewEmployee}
                    onSubmit={handleAddEmployee}
                    onClose={() => setIsAdding(false)}
                    buttonText="Create Employee"
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

            {filteredEmployees.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No employees found</h3>
                    <p>Try adjusting your search or import new data.</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
