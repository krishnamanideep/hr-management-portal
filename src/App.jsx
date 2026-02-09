import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  CalendarCheck,
  FileUp,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import Attendance from './components/Attendance';
import DataImporter from './components/DataImporter';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import { seedEmployees } from './data/seedData';

function App() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null means checking
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authentication State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Employee Data Listener
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      if (data.length === 0) {
        // One-time seeding if DB is empty
        seedEmployees.forEach(emp => {
          setDoc(doc(db, 'employees', emp.id), emp);
        });
      }
      setEmployees(data);
    });
    return () => unsub();
  }, [isAuthenticated]);

  // Attendance Data Listener
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsub = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const records = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        records[doc.id] = {
          presentIds: data.presentIds || [],
          workHours: data.workHours || {}
        };
      });
      setAttendanceRecords(records);
    });
    return () => unsub();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthenticated === null) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-main)' }}>Initializing HR Portal...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard employees={employees} attendanceRecords={attendanceRecords} />;
      case 'employees':
        return <EmployeeList employees={employees} setEmployees={setEmployees} />;
      case 'attendance':
        return (
          <Attendance
            employees={employees}
            attendanceRecords={attendanceRecords}
          />
        );

      case 'import':
        return <DataImporter />;
      default:
        return <Dashboard employees={employees} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className={`main-content ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-header)' }}>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'employees' && 'Employee Directory'}
              {activeTab === 'attendance' && 'Attendance Tracker'}
              {activeTab === 'import' && 'Import Data'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome back to your management panel</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="glass" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff' }}>
              <CalendarCheck size={18} color="var(--accent)" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="glass"
              style={{
                padding: '0.5rem 1.25rem',
                color: 'var(--danger)',
                fontWeight: 600,
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="fade-in">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
