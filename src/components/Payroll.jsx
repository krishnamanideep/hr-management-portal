import React, { useState, useMemo } from 'react';
import {
    Calculator,
    Lock,
    Download,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { logAudit } from '../utils/auditLogger';

const Payroll = ({ employees, attendanceRecords }) => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const getDaysInMonth = (monthStr) => {
        const [year, month] = monthStr.split('-').map(Number);
        return new Date(year, month, 0).getDate();
    };

    const payrollData = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = getDaysInMonth(selectedMonth);

        return employees.map(emp => {
            let presentDays = 0;
            // Iterate through each day of the month
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                if (attendanceRecords[dateStr]?.includes(emp.id)) {
                    presentDays++;
                }
            }

            const salary = emp.salary_structure || { basic: 0, hra: 0, allowances: 0 };
            const gross = salary.basic + salary.hra + salary.allowances;
            const dailyRate = gross / daysInMonth;

            const absentDays = daysInMonth - presentDays;
            const lop = dailyRate * absentDays;
            const net = gross - lop;

            return {
                ...emp,
                daysInMonth,
                presentDays,
                absentDays,
                gross,
                lop,
                net
            };
        });
    }, [employees, attendanceRecords, selectedMonth]);

    const filteredPayroll = payrollData.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generatePayslip = (emp) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 64, 175); // var(--accent)
        doc.text("PAYSLIP", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`For the Month of ${selectedMonth}`, 105, 28, { align: "center" });

        // Employee Info
        doc.line(20, 35, 190, 35);
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Employee Name: ${emp.name}`, 20, 45);
        doc.text(`Employee ID: ${emp.id}`, 20, 52);
        doc.text(`Department: ${emp.department}`, 20, 59);

        // Earnings Table
        doc.setFillColor(245, 247, 250);
        doc.rect(20, 70, 170, 10, 'F');
        doc.setFont(undefined, 'bold');
        doc.text("Description", 25, 76);
        doc.text("Amount (INR)", 185, 76, { align: "right" });

        doc.setFont(undefined, 'normal');
        let y = 88;
        const salary = emp.salary_structure || { basic: 0, hra: 0, allowances: 0 };

        doc.text("Basic Salary", 25, y);
        doc.text(salary.basic.toLocaleString(), 185, y, { align: "right" });
        y += 8;
        doc.text("HRA", 25, y);
        doc.text(salary.hra.toLocaleString(), 185, y, { align: "right" });
        y += 8;
        doc.text("Allowances", 25, y);
        doc.text(salary.allowances.toLocaleString(), 185, y, { align: "right" });
        y += 8;

        doc.line(20, y - 4, 190, y - 4);
        doc.setFont(undefined, 'bold');
        doc.text("Gross Earnings", 25, y + 2);
        doc.text(emp.gross.toLocaleString(), 185, y + 2, { align: "right" });
        y += 15;

        // Deductions
        doc.setFillColor(245, 247, 250);
        doc.rect(20, y, 170, 10, 'F');
        doc.text("Deductions", 25, y + 6);
        y += 15;

        doc.setFont(undefined, 'normal');
        doc.text(`Loss of Pay (${emp.absentDays} days)`, 25, y);
        doc.text(Math.round(emp.lop).toLocaleString(), 185, y, { align: "right" });
        y += 10;

        doc.line(20, y, 190, y);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("NET PAYOUT", 25, y + 10);
        doc.text(`INR ${Math.round(emp.net).toLocaleString()}`, 185, y + 10, { align: "right" });

        // Footer
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(150);
        doc.text("This is a computer-generated document and does not require a physical signature.", 105, 280, { align: "center" });

        doc.save(`Payslip_${emp.id}_${selectedMonth}.pdf`);
    };

    const handleLockMonth = async () => {
        if (!window.confirm(`Are you sure you want to LOCK payroll for ${selectedMonth}? This will prevent further attendance edits for this month.`)) return;

        setIsProcessing(true);
        try {
            await setDoc(doc(db, 'payroll_archive', selectedMonth), {
                month: selectedMonth,
                status: 'LOCKED',
                data: payrollData,
                lockedAt: new Date().toISOString()
            });
            await logAudit('PAYROLL_LOCK', `Locked payroll for ${selectedMonth}`, { before: null, after: { month: selectedMonth, staffCount: payrollData.length } });
            alert(`Payroll for ${selectedMonth} has been locked successfully.`);
        } catch (err) {
            console.error(err);
            alert("Failed to lock payroll.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Controls */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.25rem', borderRadius: '12px' }}>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                padding: '0.5rem',
                                color: 'var(--text-main)',
                                fontWeight: 600,
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={handleLockMonth}
                        disabled={isProcessing}
                        className="glass"
                        style={{
                            padding: '0.6rem 1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--danger)',
                            cursor: 'pointer'
                        }}
                    >
                        <Lock size={16} /> {isProcessing ? 'Processing...' : 'Lock Month'}
                    </button>
                    <button className="glass" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
                        <Download size={16} /> Export All
                    </button>
                </div>
            </div>

            {/* Search & Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, background: 'white', maxWidth: '400px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Net Payout</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                            ₹{payrollData.reduce((acc, p) => acc + p.net, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ background: 'var(--secondary)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <th style={{ padding: '1.25rem' }}>Employee</th>
                                <th style={{ padding: '1.25rem' }}>Days (P/T)</th>
                                <th style={{ padding: '1.25rem' }}>Gross Salary</th>
                                <th style={{ padding: '1.25rem' }}>LOP Deduction</th>
                                <th style={{ padding: '1.25rem' }}>Net Payout</th>
                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayroll.map((emp) => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid var(--glass-border)' }} className="table-row">
                                    <td style={{ padding: '1.25rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{emp.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.id} • {emp.department}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{emp.presentDays}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>/ {emp.daysInMonth}</span>
                                            {emp.absentDays > 0 && (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    -{emp.absentDays} LOP
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>₹{emp.gross.toLocaleString()}</td>
                                    <td style={{ padding: '1.25rem', color: 'var(--danger)' }}>-₹{Math.round(emp.lop).toLocaleString()}</td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>
                                            ₹{Math.round(emp.net).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => generatePayslip(emp)}
                                            className="glass"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            View Slip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayroll.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Calculator size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No payroll data found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payroll;
