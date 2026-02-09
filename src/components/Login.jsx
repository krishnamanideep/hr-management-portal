import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onLogin();
        } catch (err) {
            console.error(err);
            setError(isRegistering ? 'Failed to create account. ' + err.message : 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 1.5rem',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
                    }}>
                        <img src="/logo.png" alt="DOCK Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>DOCK Admin Portal</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Sign in to manage employees and attendance</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                className="glass-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                className="glass-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'var(--danger)',
                            fontSize: '0.875rem',
                            background: 'var(--danger-light)',
                            padding: '0.75rem',
                            borderRadius: '10px'
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            justifyContent: 'center'
                        }}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (isRegistering ? 'Create Admin Account' : 'Sign In')}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistering(!isRegistering);
                            setError('');
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            marginTop: '0.5rem'
                        }}
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'Need to create an admin? Sign Up'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
