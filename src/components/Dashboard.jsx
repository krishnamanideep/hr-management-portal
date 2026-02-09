import React, { useMemo } from 'react';
import { Users, UserCheck, UserX, TrendingUp, Building2, Calendar, Award, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const Dashboard = ({ employees, attendanceRecords }) => {
    // Calculate today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayPresent = attendanceRecords[today]?.length || 0;
    const todayAbsent = employees.length - todayPresent;
    const attendanceRate = employees.length > 0 ? ((todayPresent / employees.length) * 100).toFixed(1) : 0;

    // Department statistics
    const departmentStats = useMemo(() => {
        const stats = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            if (!stats[dept]) {
                stats[dept] = { total: 0, present: 0 };
            }
            stats[dept].total++;
            if (attendanceRecords[today]?.includes(emp.id)) {
                stats[dept].present++;
            }
        });
        return Object.entries(stats).map(([name, data]) => ({
            name,
            total: data.total,
            present: data.present,
            rate: ((data.present / data.total) * 100).toFixed(1)
        })).sort((a, b) => b.total - a.total);
    }, [employees, attendanceRecords, today]);

    // Last 7 days attendance trend
    const attendanceTrend = useMemo(() => {
        const trend = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const present = attendanceRecords[dateStr]?.length || 0;
            trend.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                present,
                absent: employees.length - present,
                rate: employees.length > 0 ? ((present / employees.length) * 100).toFixed(1) : 0
            });
        }
        return trend;
    }, [employees, attendanceRecords]);

    // Department distribution for pie chart
    const departmentDistribution = useMemo(() => {
        const dist = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Unassigned';
            dist[dept] = (dist[dept] || 0) + 1;
        });
        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [employees]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} color={color} />
                </div>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: trend > 0 ? 'var(--success)' : 'var(--danger)'
                    }}>
                        <TrendingUp size={14} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-header)' }}>{value}</h3>
                {subtitle && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <MetricCard
                    icon={Users}
                    title="Total Employees"
                    value={employees.length}
                    subtitle="Active workforce"
                    color="var(--accent)"
                />
                <MetricCard
                    icon={UserCheck}
                    title="Present Today"
                    value={todayPresent}
                    subtitle={`${attendanceRate}% attendance rate`}
                    color="var(--success)"
                    trend={5.2}
                />
                <MetricCard
                    icon={UserX}
                    title="Absent Today"
                    value={todayAbsent}
                    subtitle={`${(100 - attendanceRate).toFixed(1)}% of workforce`}
                    color="var(--danger)"
                />
                <MetricCard
                    icon={Building2}
                    title="Departments"
                    value={departmentStats.length}
                    subtitle="Active departments"
                    color="var(--accent-dark)"
                />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* Attendance Trend */}
                <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                            <Calendar size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            7-Day Attendance Trend
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Daily attendance over the past week</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={attendanceTrend}>
                            <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.75rem' }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="present" stroke="var(--success)" strokeWidth={2} name="Present" />
                            <Line type="monotone" dataKey="absent" stroke="var(--danger)" strokeWidth={2} name="Absent" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                            <Building2 size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Department Distribution
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Employee count by department</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={departmentDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {departmentDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Department Performance Table */}
            <div className="glass-card fade-in" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        <Award size={20} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Department Performance
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Today's attendance by department</p>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th style={{ textAlign: 'center' }}>Total Employees</th>
                                <th style={{ textAlign: 'center' }}>Present</th>
                                <th style={{ textAlign: 'center' }}>Attendance Rate</th>
                                <th style={{ textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentStats.map((dept, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: COLORS[idx % COLORS.length]
                                            }} />
                                            <span style={{ fontWeight: 600 }}>{dept.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{dept.total}</td>
                                    <td style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{dept.present}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            background: dept.rate >= 80 ? 'var(--success-light)' : dept.rate >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'var(--danger-light)',
                                            color: dept.rate >= 80 ? 'var(--success)' : dept.rate >= 60 ? '#f59e0b' : 'var(--danger)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem'
                                        }}>
                                            {dept.rate}%
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            background: dept.rate >= 80 ? 'var(--success-light)' : dept.rate >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'var(--danger-light)',
                                            color: dept.rate >= 80 ? 'var(--success)' : dept.rate >= 60 ? '#f59e0b' : 'var(--danger)',
                                            fontWeight: 700
                                        }}>
                                            {dept.rate >= 80 ? 'EXCELLENT' : dept.rate >= 60 ? 'GOOD' : 'NEEDS ATTENTION'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
