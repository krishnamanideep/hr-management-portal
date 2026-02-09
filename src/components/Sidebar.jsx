import React from 'react';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileUp,
    ChevronLeft,
    ChevronRight,

    ClipboardList
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'employees', label: 'Employees', icon: <Users size={20} /> },
        { id: 'attendance', label: 'Attendance', icon: <CalendarCheck size={20} /> },

        { id: 'audit', label: 'Audit Logs', icon: <ClipboardList size={20} /> },
        { id: 'import', label: 'Import Data', icon: <FileUp size={20} /> },
    ];

    return (
        <aside className={`sidebar ${!isOpen ? 'collapsed' : ''} `}>
            <div className="sidebar-logo">
                <div style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: '8px' }}>
                    <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {isOpen && <span style={{ fontSize: '1.25rem' }}>DOCK HR</span>}
            </div>

            <nav className="nav-links">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav - item ${activeTab === item.id ? 'active' : ''} `}
                        onClick={() => setActiveTab(item.id)}
                    >
                        {item.icon}
                        {isOpen && <span>{item.label}</span>}
                    </div>
                ))}
            </nav>

            <button
                className="glass"
                style={{
                    marginTop: 'auto',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-muted)'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

        </aside>
    );
};

export default Sidebar;
