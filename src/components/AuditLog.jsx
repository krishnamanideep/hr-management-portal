import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    Calendar,
    User,
    Activity,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, 'audit_logs'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLogs(logData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action) => {
        if (action?.includes('CREATE') || action?.includes('ADD')) return 'var(--success)';
        if (action?.includes('DELETE') || action?.includes('REMOVE')) return 'var(--danger)';
        if (action?.includes('UPDATE') || action?.includes('EDIT')) return 'var(--accent)';
        return 'var(--text-muted)';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="glass" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, background: 'white', maxWidth: '400px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search logs (admin, action, details)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                    />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Showing latest 50 activities
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0 }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <History className="animate-spin" size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>Loading audit trails...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredLogs.map((log, index) => (
                            <div key={log.id} style={{
                                padding: '1.5rem',
                                borderBottom: index === filteredLogs.length - 1 ? 'none' : '1px solid var(--glass-border)',
                                display: 'flex',
                                gap: '1.5rem',
                                transition: 'background 0.2s ease'
                            }} className="table-row">
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'var(--secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getActionColor(log.action)
                                }}>
                                    <Activity size={24} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                color: getActionColor(log.action),
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                background: 'rgba(0,0,0,0.03)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                marginRight: '0.75rem'
                                            }}>
                                                {log.action}
                                            </span>
                                            <span style={{ fontWeight: 600 }}>{log.details}</span>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Calendar size={12} />
                                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                            <User size={14} />
                                            <span>Admin: {log.adminEmail || 'System'}</span>
                                        </div>
                                        {log.reason && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--accent)' }}>
                                                <AlertCircle size={14} />
                                                <span>Reason: {log.reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    {log.changes && (
                                        <div style={{
                                            marginTop: '1rem',
                                            padding: '1rem',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            fontSize: '0.8125rem',
                                            border: '1px solid #edf2f7'
                                        }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
                                                <div style={{ color: 'var(--danger)', opacity: 0.7 }}>{JSON.stringify(log.changes.before || 'None')}</div>
                                                <ArrowRight size={14} color="var(--text-muted)" />
                                                <div style={{ color: 'var(--success)' }}>{JSON.stringify(log.changes.after || 'None')}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {filteredLogs.length === 0 && (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <History size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>No audit logs matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLog;
