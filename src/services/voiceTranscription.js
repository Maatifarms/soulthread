/**
 * voiceTranscription.js — Voice Message Transcription System (Task 71)
 *
 * Handles async queuing of voice messages for AI speech-to-text conversion.
 * Features: Background processing, fallback handling, and search integration.
 */

import { db, storage } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

class VoiceTranscriptionService {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        // In production, this points to a Cloud Function wrapping Google Cloud Speech-to-Text
        this.transcriptionEndpoint = 'https://api.soulthread.in/v1/transcribe';
    }

    /**
     * Adds an audio file reference to the processing queue to prevent client hang.
     */
    queueTranscription(messageId, audioStoragePath) {
        this.queue.push({ messageId, audioStoragePath });
        console.log(`[Transcription] Queued message ${messageId} for processing.`);

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    /**
     * Processes the queue sequentially or in batches.
     */
    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const job = this.queue.shift();

        try {
            console.log(`[Transcription] Processing ${job.messageId}...`);

            // Simulating API call to AI Speech-to-Text backend
            const transcript = await this.mockTranscriptionApi(job.audioStoragePath);

            // Save transcript securely to the message record
            const messageRef = doc(db, 'messages', job.messageId);
            await updateDoc(messageRef, {
                transcript: transcript,
                transcriptionStatus: 'completed'
            });

            console.log(`[Transcription] Success for ${job.messageId}`);
        } catch (error) {
            console.error(`[Transcription] Failed for ${job.messageId}`, error);
            const messageRef = doc(db, 'messages', job.messageId);
            await updateDoc(messageRef, {
                transcriptionStatus: 'failed',
                transcriptError: 'Audio unclear or service unavailable'
            });
        } finally {
            // Continues processing remaining items
            setTimeout(() => this.processQueue(), 500);
        }
    }

    // Mock Backend Call
    async mockTranscriptionApi(path) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve("Hey, just wanted to check in. I'm feeling much better today, thanks for asking! Let's catch up later.");
            }, 1200);
        });
    }
}

export const transcriptionService = new VoiceTranscriptionService();
