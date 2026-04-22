import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Auth.css';

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        profession: '',
        place: '',
        gender: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return setError('Password should be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(formData.email, formData.password, formData.name, {
                profession: formData.profession,
                place: formData.place,
                gender: formData.gender
            });
            navigate(`/profile/${userCredential.user.uid}`, { state: { justSignedUp: true } });
        } catch (err) {
            console.error(err);
            setError('Failed to create an account. ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.08,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="auth-page">
            <div className="auth-logo-section">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, rotate: 10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                >
                    <svg width="80" height="70" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '12px' }}>
                        <path d="M60 80 C60 80 20 55 20 32 C20 20 29 12 40 12 C48 12 55 17 60 23 C65 17 72 12 80 12 C91 12 100 20 100 32 C100 55 60 80 60 80Z" fill="white" />
                        <motion.path 
                            d="M38 28 C38 28 42 20 50 24 C58 28 52 36 58 38 C64 40 68 34 72 32" 
                            stroke="#3d7a72" 
                            strokeWidth="3.5" 
                            strokeLinecap="round" 
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />
                    </svg>
                </motion.div>
                <motion.h1 
                    className="auth-logo-title" 
                    style={{ fontSize: '32px' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Join Sanctuary
                </motion.h1>
                <motion.p 
                    className="auth-logo-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Begin your journey to a peaceful mind
                </motion.p>
            </div>

            <motion.main 
                className="auth-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="auth-handle-bar" />

                <motion.h2 variants={itemVariants} className="auth-title">Create Account</motion.h2>
                <motion.p variants={itemVariants} className="auth-subtitle">Join our supportive community and find your soul space.</motion.p>

                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="auth-alert auth-alert-error">
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <motion.div variants={itemVariants} className="auth-input-group">
                        <label className="auth-label">Soul Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name (or Pseudonym)"
                            className="auth-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@email.com"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="auth-input-group">
                            <label className="auth-label">Profession</label>
                            <input
                                type="text"
                                name="profession"
                                placeholder="Student, Writer..."
                                className="auth-input"
                                value={formData.profession}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">Location</label>
                            <input
                                type="text"
                                name="place"
                                placeholder="City / Country"
                                className="auth-input"
                                value={formData.place}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="auth-input-group">
                        <label className="auth-label">Gender Identity</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            disabled={loading}
                        >
                            <option value="" disabled>Select Sense</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-Binary">Non-Binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min 6 chars"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Match password"
                                className="auth-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span className="spinner-small" /> Creating Soul...
                            </span>
                        ) : 'Sign Up'}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-footer-link">
                        Log In
                    </Link>
                </div>
            </motion.main>
        </div>
    );
};

export default Signup;
