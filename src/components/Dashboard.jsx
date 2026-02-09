import React from 'react';
import {
    Users,
    CalendarCheck,
    UserPlus,
    Clock,
    Briefcase,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { motion } from 'framer-motion';

const Dashboard = ({ employees, attendanceRecords }) => {
    const today = new Date().toISOString().split('T')[0];
    const presentTodayIds = attendanceRecords[today] || [];

    // Analytics calculation
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE' || e.status === 'Active').length;
    const inactiveEmployees = employees.length - activeEmployees;
    const presentToday = presentTodayIds.length;

    const departmentData = employees.reduce((acc, emp) => {
        const dept = emp.department || 'General';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(departmentData).map(([name, value]) => ({ name, value }));
    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const stats = [
        { label: 'Total Staff', value: employees.length, icon: <Users size={24} />, color: 'var(--accent)' },
        { label: 'Present Today', value: presentToday, icon: <CalendarCheck size={24} />, color: 'var(--success)' },
        { label: 'Active Workforce', value: activeEmployees, icon: <Activity size={24} />, color: '#8b5cf6' },
        { label: 'Inactive/Exit', value: inactiveEmployees, icon: <Clock size={24} />, color: 'var(--danger)' },
    ];

    // Generate dynamic weekly data from history
    const weeklyData = [4, 3, 2, 1, 0].map(offset => {
        const d = new Date();
        d.setDate(d.getDate() - offset);
        const dateStr = d.toISOString().split('T')[0];
        const count = (attendanceRecords[dateStr] || []).length;
        return {
            name: d.toLocaleDateString('en-US', { weekday: 'short' }),
            attendance: count
        };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}
            >
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            background: stat.color,
                            padding: '1rem',
                            borderRadius: '12px',
                            color: 'white',
                            boxShadow: `0 4px 12px ${stat.color}40`
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-header)' }}>Attendance Trends (Last 5 Days)</h3>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                                <defs>
                                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ background: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
                                />
                                <Area type="monotone" dataKey="attendance" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-header)' }}>Department Distribution</h3>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>{pieData.length} Depts</span>
                    </div>

                    <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ width: '50%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'white', border: '1px solid var(--glass-border)', borderRadius: '8px', boxShadow: 'var(--card-shadow)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ width: '50%', overflowY: 'auto', maxHeight: '250px', paddingRight: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {pieData.map((entry, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{entry.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{entry.value}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({Math.round((entry.value / employees.length) * 100)}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-header)' }}>Operational Metrics</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                        <p style={{ color: 'var(--success)', fontSize: '2rem', fontWeight: 700 }}>{activeEmployees}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Active Personnel</p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                        <p style={{ color: 'var(--danger)', fontSize: '2rem', fontWeight: 700 }}>{inactiveEmployees}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Exited / Inactive</p>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc' }}>
                        <p style={{ color: 'var(--accent)', fontSize: '2rem', fontWeight: 700 }}>{Math.round((activeEmployees / (employees.length || 1)) * 100)}%</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Retention Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
