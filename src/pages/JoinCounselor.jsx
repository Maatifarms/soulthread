import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const JoinCounselor = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        qualification: '',
        experience: '',
        bio: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, 'applications'), {
                ...formData,
                userId: currentUser ? currentUser.uid : null, // If logged in, link user
                status: 'pending',
                photoURL: currentUser ? currentUser.photoURL : null,
                isCounselorApplication: true,
                createdAt: serverTimestamp()
            });

            alert("Application submitted! Our team will review it.");
            navigate('/');
        } catch (error) {
            console.error("Error submitting application:", error);
            alert("Failed to submit application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '600px' }}>
            <div style={{ background: 'var(--color-surface)', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', color: 'var(--color-primary)', marginBottom: '20px' }}>Join as a Counselor</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--color-text-secondary)' }}>
                    Help us support mental wellness. Apply to become a verified counselor on SoulThread.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            required
                            type="text"
                            placeholder="Dr. Jane Doe"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="jane@example.com"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Qualification / License</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g., MSc Clinical Psychology, License #12345"
                            className="form-input"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Years of Experience</label>
                        <select
                            required
                            className="form-input"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        >
                            <option value="">Select Experience</option>
                            <option value="0-2 years">0-2 years</option>
                            <option value="3-5 years">3-5 years</option>
                            <option value="5-10 years">5-10 years</option>
                            <option value="10+ years">10+ years</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Short Bio</label>
                        <textarea
                            required
                            rows="4"
                            placeholder="Tell us about your approach and specialty..."
                            className="form-input"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ padding: '15px', fontSize: '16px', marginTop: '10px' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinCounselor;
