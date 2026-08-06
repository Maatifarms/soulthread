const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { Logger } = require('./Logger');

/**
 * Health Endpoints for Uptime Monitoring (Pingdom, UptimeRobot, GCP Monitoring)
 */
exports.healthCheck = functions.https.onRequest(async (req, res) => {
  const correlationId = req.headers['x-request-id'] || `health-${Date.now()}`;
  
  try {
    const start = Date.now();
    
    // 1. Verify Firestore Connectivity (Readiness)
    const db = admin.firestore();
    // A lightweight query to ensure the DB is reachable
    await db.collection('_system_health').doc('ping').set({
      lastCheck: admin.firestore.FieldValue.serverTimestamp()
    });

    const latency = Date.now() - start;

    Logger.info('Health check passed', { 
      correlationId, 
      latencyMs: latency,
      status: 'UP'
    });

    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'UP',
          latencyMs: latency
        }
      }
    });
  } catch (error) {
    Logger.fatal('Health check failed', { correlationId }, error);
    
    res.status(503).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
