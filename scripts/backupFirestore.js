/**
 * scripts/backupFirestore.js
 * 
 * Disaster Recovery and Database Backup Implementation (Task 24)
 * Run daily via cron / Google Cloud Scheduler.
 */

const { execSync } = require('child_process');

const PROJECT_ID = "soulthread-prod";
const BACKUP_BUCKET = "gs://soulthread-prod-backups/firestore";

try {
    console.log(`[Backup] Initiating Firestore export for project: ${PROJECT_ID}`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destination = `${BACKUP_BUCKET}/backup-${timestamp}`;

    // Note: Requires Google Cloud CLI authenticated.
    const cmd = `gcloud firestore export ${destination} --project=${PROJECT_ID}`;
    execSync(cmd, { stdio: 'inherit' });

    console.log(`[Backup] Successfully exported Firestore snapshot to ${destination}`);
} catch (error) {
    console.error("[Backup] Disaster Recovery backup failed:", error.message);
    process.exit(1);
}
