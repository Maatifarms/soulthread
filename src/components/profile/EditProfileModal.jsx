import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import useTheme from '../../hooks/useTheme';
import ImageCropper from '../common/ImageCropper';

const EditProfileModal = ({ userProfile, onClose, onUpdate }) => {
    const { currentUser } = useAuth();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);
    const { isDarkMode, toggleTheme } = useTheme();
    const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [socials, setSocials] = useState(userProfile?.socials || { instagram: '', twitter: '', linkedin: '' });
    const [isAnonymousAccount, setIsAnonymousAccount] = useState(userProfile?.isAnonymous || false);
    const [isIncognito, setIsIncognito] = useState(userProfile?.isIncognito || false);
    const [isPaused, setIsPaused] = useState(userProfile?.isPaused || false);
    const [age, setAge] = useState(userProfile?.age || '');
    const [hideSensitiveContent, setHideSensitiveContent] = useState(userProfile?.hideSensitiveContent || false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSupportInfo, setShowSupportInfo] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImageForCrop, setTempImageForCrop] = useState(null);

    const MAX_BIO_LENGTH = 200;
    const bioLength = bio.length;
    const isBioNearLimit = bioLength > 180;

    // Track changes
    useEffect(() => {
        const changed =
            displayName !== (userProfile?.displayName || '') ||
            bio !== (userProfile?.bio || '') ||
            JSON.stringify(socials) !== JSON.stringify(userProfile?.socials || {}) ||
            isAnonymousAccount !== (userProfile?.isAnonymous || false) ||
            isIncognito !== (userProfile?.isIncognito || false) ||
            isPaused !== (userProfile?.isPaused || false) ||
            age !== (userProfile?.age || '') ||
            hideSensitiveContent !== (userProfile?.hideSensitiveContent || false) ||
            avatarFile !== null;
        setHasUnsavedChanges(changed);
    }, [displayName, bio, socials, isAnonymousAccount, isIncognito, isPaused, age, avatarFile, userProfile]);

    // Auto-save draft to localStorage
    useEffect(() => {
        if (hasUnsavedChanges) {
            const draft = { displayName, bio, socials };
            localStorage.setItem('profile_draft', JSON.stringify(draft));
        }
    }, [displayName, bio, socials, hasUnsavedChanges]);

    const handleSocialChange = (platform, value) => {
        setSocials(prev => ({ ...prev, [platform]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setTempImageForCrop(imageUrl);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (croppedBlob) => {
        setAvatarFile(croppedBlob);
        setAvatarPreview(URL.createObjectURL(croppedBlob));
        setShowCropper(false);
        setTempImageForCrop(null);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setTempImageForCrop(null);
    };

    const handleRemovePhoto = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalPhotoURL = userProfile?.photoURL;

            // 1. Upload Avatar if changed
            if (avatarFile) {
                const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}_${avatarFile.name}`);
                const uploadResult = await uploadBytes(storageRef, avatarFile);
                finalPhotoURL = await getDownloadURL(uploadResult.ref);
            }

            // 2. Update Auth Profile
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName,
                    photoURL: finalPhotoURL
                }).catch(err => console.error("Auth update warning:", err));
            }

            // 3. Update Firestore Document
            const userRef = doc(db, 'users', currentUser.uid);
            const updatedData = {
                displayName: displayName || '',
                bio: bio || '',
                socials: socials || {},
                photoURL: finalPhotoURL || null,
                isAnonymous: isAnonymousAccount,
                isIncognito: isIncognito,
                isPaused: isPaused,
                age: age || null,
                hideSensitiveContent: hideSensitiveContent,
                updatedAt: new Date().toISOString()
            };

            await setDoc(userRef, updatedData, { merge: true });

            // 4. Clear draft
            localStorage.removeItem('profile_draft');

            // 5. Update Local State
            onUpdate({ ...userProfile, ...updatedData });
            onClose();

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (hasUnsavedChanges) {
            if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const [blockedUsersData, setBlockedUsersData] = useState([]);

    useEffect(() => {
        const fetchBlocked = async () => {
            if (currentUser?.blockedUsers?.length > 0) {
                try {
                    const promises = currentUser.blockedUsers.map(uid => getDoc(doc(db, 'users', uid)));
                    const snaps = await Promise.all(promises);
                    const users = snaps.map(s => ({ id: s.id, ...s.data() }));
                    setBlockedUsersData(users);
                } catch (e) { console.error("Error fetching blocked", e); }
            } else {
                setBlockedUsersData([]);
            }
        };
        fetchBlocked();
    }, [currentUser]);

    const handleUnblock = async (uidToUnblock) => {
        if (!window.confirm("Unblock this user?")) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                blockedUsers: arrayRemove(uidToUnblock)
            });
            setBlockedUsersData(prev => prev.filter(u => u.id !== uidToUnblock));
            alert("User unblocked.");
        } catch (e) {
            console.error(e);
            alert("Failed to unblock.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmContent = "PERMANENTLY DELETE YOUR ACCOUNT?\n\nThis will remove your profile, posts, and connections. This action CANNOT be undone.";
        if (!window.confirm(confirmContent)) return;

        const finalConfirm = "Are you absolutely sure? Type 'DELETE' to confirm.";
        const userInput = window.prompt(finalConfirm);

        if (userInput !== 'DELETE') {
            alert("Deletion cancelled.");
            return;
        }

        setLoading(true);
        try {
            // Delete user document
            await doc(db, 'users', currentUser.uid).delete(); // Note: Simplified, usually handled by Cloud Functions for thorough cleanup
            alert("Account deleted. We're sorry to see you go.");
            window.location.href = '/';
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        { id: 'social', label: 'Social Links', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg> },
        { id: 'privacy', label: 'Privacy', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> }
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }} onClick={handleClose}>
            <div style={{
                background: 'var(--color-surface)',
                borderRadius: '20px',
                maxWidth: '550px',
                width: '90%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '22px' }}>Edit Profile</h2>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-background-soft)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '14px 20px',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                                borderBottom: activeTab === tab.id ? '3px solid var(--color-primary)' : '3px solid transparent',
                                color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontWeight: activeTab === tab.id ? '700' : '600',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
                    {activeTab === 'basic' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Avatar Upload */}
                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {avatarPreview || userProfile?.photoURL ? (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={avatarPreview || userProfile?.photoURL}
                                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }}
                                            alt="Avatar"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemovePhoto}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: '#ff4444',
                                                color: 'white',
                                                border: '2px solid white',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-primary-light)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '40px',
                                        fontWeight: 'bold',
                                        color: 'var(--color-primary-dark)',
                                        border: '3px solid var(--color-primary)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {displayName ? displayName.charAt(0) : 'U'}
                                    </div>
                                )}
                                <div style={{ marginTop: '12px' }}>
                                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer', color: 'var(--color-primary)', fontSize: '14px', fontWeight: '600' }}>
                                        {avatarPreview || userProfile?.photoURL ? 'Change Photo' : 'Upload Photo'}
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Display Name */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Display Name</label>
                                <input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                />
                            </div>

                            {/* Age */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="Your age"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)', fontSize: '14px' }}
                                />
                            </div>

                            {/* Bio */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    maxLength={MAX_BIO_LENGTH}
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text-primary)', fontFamily: 'inherit', fontSize: '14px', resize: 'none' }}
                                />
                                <div style={{
                                    fontSize: '12px',
                                    color: isBioNearLimit ? '#ff9800' : 'var(--color-text-secondary)',
                                    marginTop: '4px',
                                    textAlign: 'right',
                                    fontWeight: isBioNearLimit ? '600' : 'normal'
                                }}>
                                    {bioLength}/{MAX_BIO_LENGTH}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 8px 0' }}>
                                Connect your social profiles to help others find and connect with you.
                            </p>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Instagram</label>
                                <input
                                    placeholder="username (without @)"
                                    value={socials.instagram}
                                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Twitter</label>
                                <input
                                    placeholder="@handle"
                                    value={socials.twitter}
                                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: '14px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>LinkedIn</label>
                                <input
                                    placeholder="Profile URL"
                                    value={socials.linkedin}
                                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: '14px' }}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* --- ANONYMOUS PROFILE (Highest Privacy) --- */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: isAnonymousAccount ? '#fff5f5' : 'var(--color-background)',
                                borderRadius: '12px',
                                border: `1.5px solid ${isAnonymousAccount ? '#dc2626' : 'var(--color-border)'}`,
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', color: isAnonymousAccount ? '#dc2626' : 'var(--color-text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Anonymous Profile
                                            {isAnonymousAccount && <span style={{ fontSize: '10px', background: '#dc2626', color: 'white', padding: '2px 7px', borderRadius: '10px', fontWeight: '700' }}>ACTIVE</span>}
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                                            Your real name will <strong>never</strong> appear publicly. Posts show as "Anonymous". Your profile is blocked from all search and direct URLs. Your user ID is retained securely for moderation.
                                        </div>
                                        {isAnonymousAccount && (
                                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                                                Active - your name and profile are fully hidden from all other users.
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        onClick={() => setIsAnonymousAccount(!isAnonymousAccount)}
                                        style={{
                                            width: '48px', height: '26px',
                                            backgroundColor: isAnonymousAccount ? '#dc2626' : '#ccc',
                                            borderRadius: '13px', position: 'relative',
                                            cursor: 'pointer', transition: 'background-color 0.3s',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '22px', height: '22px', backgroundColor: 'white',
                                            borderRadius: '50%', position: 'absolute', top: '2px',
                                            left: isAnonymousAccount ? '24px' : '2px',
                                            transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Incognito Toggle */}
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Incognito Mode</div>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                                            Hide from Community search. No one can send you requests or messages.
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setIsIncognito(!isIncognito)}
                                        style={{
                                            width: '48px',
                                            height: '26px',
                                            backgroundColor: isIncognito ? 'var(--color-primary)' : '#ccc',
                                            borderRadius: '13px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            marginLeft: '16px',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: isIncognito ? '24px' : '2px',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Pause Account Toggle */}
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Pause Account</div>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                                            Temporarily hide your profile and posts from the community.
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setIsPaused(!isPaused)}
                                        style={{
                                            width: '48px',
                                            height: '26px',
                                            backgroundColor: isPaused ? 'var(--color-primary)' : '#ccc',
                                            borderRadius: '13px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            marginLeft: '16px',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: isPaused ? '24px' : '2px',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Hide Sensitive Content Toggle */}
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Safe Feed</div>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                                            Hide content tagged as sensitive or emotionally heavy.
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setHideSensitiveContent(!hideSensitiveContent)}
                                        style={{
                                            width: '48px',
                                            height: '26px',
                                            backgroundColor: hideSensitiveContent ? 'var(--color-primary)' : '#ccc',
                                            borderRadius: '13px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s',
                                            marginLeft: '16px',
                                            flexShrink: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '22px',
                                            height: '22px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: hideSensitiveContent ? '24px' : '2px',
                                            transition: 'left 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>
                            </div>

                            {/* Theme Toggle */}
                            <div style={{ padding: '16px', backgroundColor: 'var(--color-background)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Appearance</div>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                                            Switch between Sanctuary Light and Deep Sanctuary Dark.
                                        </div>
                                    </div>
                                    <div
                                        onClick={toggleTheme}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-surface)',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            fontSize: '12px',
                                            color: 'var(--color-primary)'
                                        }}
                                    >
                                        {isDarkMode ? 'Dark' : 'Light'}
                                    </div>
                                </div>
                            </div>

                            {/* Delete Account Button */}
                            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ffcccc', borderRadius: '12px', background: '#fff5f5' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Danger Zone</h4>
                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: '#c62828',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Delete My Account
                                </button>
                            </div>

                            {/* Blocked Users */}
                            {blockedUsersData.length > 0 && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#ff4444', marginBottom: '12px' }}>Blocked Users</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {blockedUsersData.map(u => (
                                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--color-background)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600' }}>{u.displayName || 'Unknown'}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUnblock(u.id)}
                                                    style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', background: 'var(--color-surface)', fontWeight: '600' }}
                                                >
                                                    Unblock
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Help & Support Section at the bottom of the form */}
                    <div style={{ marginTop: '30px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                        <button
                            type="button"
                            onClick={() => setShowSupportInfo(!showSupportInfo)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--color-background-soft)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '12px',
                                color: 'var(--color-primary-dark)',
                                fontWeight: '700',
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {showSupportInfo ? 'Hide Help & Support' : 'Help & Support'}
                        </button>

                        {showSupportInfo && (
                            <div style={{
                                "marginTop": '15px',
                                "padding": '15px',
                                "background": 'var(--color-surface)',
                                "borderRadius": '12px',
                                "border": '1px dotted var(--color-primary)',
                                "animation": 'fadeIn 0.3s ease'
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--color-primary-dark)' }}>SoulThread Support</div>
                                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                    <span style={{ fontWeight: '600' }}>support@soulthread.in</span>
                                </div>
                                <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    <span style={{ fontWeight: '600' }}>+91 9169658628</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                                    For crisis support, please visit our <a href="/care" target="_blank" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Care Page</a>.
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Sticky Footer */}
                <div style={{ padding: '20px 30px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', gap: '12px' }}>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '24px',
                            border: '1px solid var(--color-border)',
                            background: 'transparent',
                            color: 'var(--color-text-primary)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading || !hasUnsavedChanges}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '24px',
                            border: 'none',
                            background: (!hasUnsavedChanges || loading) ? '#ccc' : 'var(--color-primary)',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '14px',
                            cursor: (!hasUnsavedChanges || loading) ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {/* Image Cropper Modal */}
                {showCropper && tempImageForCrop && (
                    <ImageCropper
                        image={tempImageForCrop}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                    />
                )}
            </div>
        </div>
    );
};

export default EditProfileModal;
