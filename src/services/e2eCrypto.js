/**
 * e2eCrypto.js — End-to-End Encryption for Private Messaging
 * 
 * Uses Web Crypto API (ECDH + AES-GCM).
 * Generates an ECDH key pair per user. Public keys are exchanged to derive
 * a shared AES-256-GCM symmetric key for true end-to-end message encryption.
 * The server never sees the raw messages.
 */

// Convert base64 to Uint8Array
function b64ToUint8Array(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// Convert Uint8Array to base64
function uint8ArrayToB64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Generate ECDH Key Pair
export async function generateUserKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey']
    );
    return keyPair;
}

// Export a public key to Base64 (to be stored in Firestore User Profile)
export async function exportPublicKey(key) {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return uint8ArrayToB64(new Uint8Array(exported));
}

// Export a private key (to be securely stored in IndexedDB/session on user's device)
export async function exportPrivateKey(key) {
    const exported = await window.crypto.subtle.exportKey('pkcs8', key);
    return uint8ArrayToB64(new Uint8Array(exported));
}

// Import a public key from Base64 (from other user's Firestore profile)
export async function importPublicKey(b64Key) {
    const buf = b64ToUint8Array(b64Key);
    return await window.crypto.subtle.importKey(
        'raw', buf,
        { name: 'ECDH', namedCurve: 'P-256' },
        true, []
    );
}

// Import private key from Base64 (from local storage)
export async function importPrivateKey(b64Key) {
    const buf = b64ToUint8Array(b64Key);
    return await window.crypto.subtle.importKey(
        'pkcs8', buf,
        { name: 'ECDH', namedCurve: 'P-256' },
        true, ['deriveKey']
    );
}

// Derive Shared Session Key (AES-GCM)
export async function deriveSharedSecret(myPrivateKey, otherPublicKey) {
    return await window.crypto.subtle.deriveKey(
        { name: 'ECDH', public: otherPublicKey },
        myPrivateKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt Message String
export async function encryptMessage(sharedKey, text) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        sharedKey,
        encoded
    );

    // Package IV + Ciphertext in a single struct
    return {
        iv: uint8ArrayToB64(iv),
        ciphertext: uint8ArrayToB64(new Uint8Array(ciphertext))
    };
}

// Decrypt Message String
export async function decryptMessage(sharedKey, ivB64, ciphertextB64) {
    try {
        const iv = b64ToUint8Array(ivB64);
        const ciphertext = b64ToUint8Array(ciphertextB64);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            sharedKey,
            ciphertext
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error("E2E Decryption failed: ", e);
        return "🔒 [Encrypted Message]";
    }
}
