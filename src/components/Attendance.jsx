import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    Download,
    CheckSquare,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Users as UsersIcon,
    Search,
    Filter
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Attendance = ({ employees, attendanceRecords }) => {
    // Filter to only Field Team employees (ZMs and FOAs) for attendance tracking
    const fieldTeamEmployees = useMemo(() => {
        return employees.filter(emp => {
            const position = emp.position || '';
            return position.includes('Zonal Manager') ||
                position.includes('Field Operation Agent') ||
                position.includes('FOA') ||
                position.includes('ZM');
        });
    }, [employees]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filter, setFilter] = useState('all'); // 'all', 'present', 'absent'
    const [selectedDept, setSelectedDept] = useState('All Departments');
    const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(fieldTeamEmployees[0]?.id || '');
    const [currentMonth, setCurrentMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [searchTerm, setSearchTerm] = useState('');

    // Get present IDs and work hours for selected date
    const attendanceData = attendanceRecords[selectedDate] || { presentIds: [], workHours: {} };
    const presentIds = attendanceData.presentIds || [];
    const workHours = attendanceData.workHours || {};

    // Extract unique departments
    const departments = useMemo(() => {
        const depts = new Set(fieldTeamEmployees.map(e => e.department).filter(Boolean));
        return ['All Departments', ...Array.from(depts).sort()];
    }, [fieldTeamEmployees]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const navigateDate = (days) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const toggleAttendance = async (id) => {
        const currentData = attendanceRecords[selectedDate] || { presentIds: [], workHours: {} };
        const currentRecord = currentData.presentIds || [];
        const isPresent = currentRecord.includes(id);
        const newRecord = isPresent
            ? currentRecord.filter(empId => empId !== id)
            : [...currentRecord, id];

        const newWorkHours = { ...currentData.workHours };
        if (!isPresent) {
            // Add random work hours when marking present
            newWorkHours[id] = Math.floor(Math.random() * 5) + 5; // 5-9 hours
        } else {
            // Remove work hours when marking absent
            delete newWorkHours[id];
        }

        try {
            await setDoc(doc(db, 'attendance', selectedDate), {
                presentIds: newRecord,
                workHours: newWorkHours
            });
        } catch (err) {
            console.error("Error updating attendance:", err);
            alert("Failed to update attendance.");
        }
    };

    const markAllPresent = async () => {
        if (window.confirm(`Mark all employees as present for ${selectedDate}?`)) {
            const allIds = fieldTeamEmployees.map(e => e.id);
            try {
                await setDoc(doc(db, 'attendance', selectedDate), {
                    presentIds: allIds
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const resetAttendance = async () => {
        if (window.confirm(`Clear all attendance records for ${selectedDate}?`)) {
            try {
                await setDoc(doc(db, 'attendance', selectedDate), {
                    presentIds: []
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    const exportToExcel = () => {
        const dataToExport = filteredEmployees.map(emp => ({
            ID: emp.id,
            Name: emp.name,
            Department: emp.department,
            Status: presentIds.includes(emp.id) ? 'Present' : 'Absent',
            Date: selectedDate
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
        XLSX.writeFile(wb, `Attendance_${selectedDate}.xlsx`);
    };

    const filteredEmployees = fieldTeamEmployees.filter(emp => {
        const isPresent = presentIds.includes(emp.id);
        const matchesFilter = filter === 'all'
            ? true
            : filter === 'present' ? isPresent : !isPresent;
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = selectedDept === 'All Departments' || emp.department === selectedDept;

        return matchesFilter && matchesSearch && matchesDept;
    });

    const renderCalendar = () => {
        const [year, month] = currentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDayIdx = new Date(year, month - 1, 1).getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const blanks = Array.from({ length: firstDayIdx }, (_, i) => i);

        return (
            <div className="glass-card fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <select
                                className="glass-input"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                style={{ minWidth: '220px' }}
                            >
                                {fieldTeamEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <input
                            type="month"
                            className="glass-input"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: 'var(--success)', borderRadius: '4px' }}></div> Present</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: 'var(--danger)', borderRadius: '4px' }}></div> Absent</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)', paddingBottom: '0.5rem' }}>{day}</div>
                    ))}
                    {blanks.map(i => <div key={`b-${i}`} />)}
                    {days.map(d => {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const isPresent = attendanceRecords[dateStr]?.presentIds?.includes(selectedEmployeeId);
                        const workHoursForDay = attendanceRecords[dateStr]?.workHours?.[selectedEmployeeId];
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                            <div
                                key={d}
                                style={{
                                    height: '100px',
                                    borderRadius: '16px',
                                    padding: '0.75rem',
                                    background: isPresent ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.03)',
                                    border: isToday ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }}
                                className="calendar-day"
                            >
                                <span style={{ fontSize: '1rem', fontWeight: 700, color: isPresent ? 'var(--success)' : 'var(--text-main)' }}>{d}</span>
                                {isPresent && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ fontSize: '0.7rem', background: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>PRESENT</div>
                                        {workHoursForDay && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                                                <Clock size={12} />
                                                {workHoursForDay} hrs
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
            {/* Header Controls */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div className="glass-toggle-group">
                        <button
                            onClick={() => setViewMode('daily')}
                            className={viewMode === 'daily' ? 'active' : ''}
                        >
                            Daily View
                        </button>
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={viewMode === 'monthly' ? 'active' : ''}
                        >
                            Monthly View
                        </button>
                    </div>

                    {viewMode === 'daily' && (
                        <div className="date-navigator glass" style={{ padding: '0.25rem 0.5rem' }}>
                            <button onClick={() => navigateDate(-1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                            />
                            <button onClick={() => navigateDate(1)}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {viewMode === 'daily' && (
                        <>
                            <button onClick={markAllPresent} className="btn-ghost success">
                                <CheckSquare size={18} /> Mark All
                            </button>
                            <button onClick={resetAttendance} className="btn-ghost">
                                <RotateCcw size={18} /> Reset
                            </button>
                        </>
                    )}
                    <button onClick={exportToExcel} className="btn-primary">
                        <Download size={18} /> Export Report
                    </button>
                </div>
            </div>

            {viewMode === 'daily' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    {/* Filter & Summary Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    className="glass-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                                />
                            </div>

                            <div style={{ position: 'relative', minWidth: '200px' }}>
                                <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <select
                                    className="glass-input"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="glass-toggle-group">
                            {['all', 'present', 'absent'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={filter === f ? 'active uppercase' : 'uppercase'}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="stats-pill glass">
                            <span className="success">Present: <strong>{presentIds.length}</strong></span>
                            <div className="divider"></div>
                            <span className="danger">Absent: <strong>{employees.length - presentIds.length}</strong></span>
                        </div>
                    </div>

                    {/* Attendance Table */}
                    <div className="glass-card fade-in" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ overflowX: 'auto', flex: 1 }}>
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Work Hours</th>
                                        <th style={{ textAlign: 'right' }}>Status & Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => {
                                        const isPresent = presentIds.includes(emp.id);
                                        return (
                                            <tr key={emp.id} className={isPresent ? 'row-present' : 'row-absent'}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div className="avatar-initials" style={{ background: isPresent ? 'var(--success-light)' : 'var(--danger-light)', color: isPresent ? 'var(--success)' : 'var(--danger)' }}>
                                                            {emp.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-header" style={{ fontWeight: 600, fontSize: '1rem' }}>{emp.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge-dept">{emp.department}</span>
                                                </td>
                                                <td>
                                                    {isPresent && workHours[emp.id] ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Clock size={14} color="var(--accent)" />
                                                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{workHours[emp.id]} hrs</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => toggleAttendance(emp.id)}
                                                        className={`status-toggle ${isPresent ? 'is-present' : 'is-absent'}`}
                                                    >
                                                        {isPresent ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                                        <span>{isPresent ? 'Present' : 'Absent'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filteredEmployees.length === 0 && (
                            <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <UsersIcon size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                                <p style={{ fontSize: '1.1rem' }}>No employees found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : renderCalendar()}
        </div>
    );
};

export default Attendance;
