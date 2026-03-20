import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const PsychologistRegistrationModal = ({ onClose }) => {
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
            await addDoc(collection(db, 'psychologist_applications'), {
                ...formData,
                status: 'pending',
                appliedAt: serverTimestamp()
            });
            alert("Application sent! Our team will contact you shortly.");
            onClose();
        } catch (error) {
            console.error("Error sending application:", error);
            alert("Failed to send application: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                background: 'var(--color-surface)',
                padding: '30px',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-md)'
            }}>
                <h2 style={{ marginBottom: '10px', color: 'var(--color-text-primary)' }}>Join as a Counselor</h2>
                <p style={{ marginBottom: '20px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Help us build a mentally healthy society. Fill out this form to apply.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    <input
                        placeholder="Full Name (e.g. Dr. Jane Doe)"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                    />

                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                    />

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            placeholder="Qualification (e.g. PhD, M.Psy)"
                            required
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                        />
                        <input
                            placeholder="Years of Exp."
                            required
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                        />
                    </div>

                    <textarea
                        placeholder="Short Bio / Why do you want to join?"
                        required
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
                    />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Sending...' : 'Submit Application'}
                        </button>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PsychologistRegistrationModal;
