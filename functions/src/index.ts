import * as functions from 'firebase-functions/v2';
import { onSchedule, ScheduledEvent } from 'firebase-functions/v2/scheduler';
import { CallableRequest } from 'firebase-functions/v2/https';

// Set global options for all functions
functions.setGlobalOptions({
  region: 'us-central1',
  maxInstances: 10,
  memory: '512MiB',
  cpu: 1,
  timeoutSeconds: 300,
});

/**
 * Scheduled function: Runs every 30 minutes to sync deals from Cuelinks API.
 * Powered by Google Cloud Scheduler + Firebase Functions v2.
 */
export const syncDeals = onSchedule(
  {
    schedule: 'every 30 minutes',
    timeZone: 'Asia/Kolkata',
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async (event: ScheduledEvent) => {
    console.log('[syncDeals] Starting scheduled deal sync...', event.scheduleTime);

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app';
      const secret = process.env.CRON_SECRET || 'muddapappu-secret';

      const response = await fetch(`${siteUrl}/api/cron/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`,
        },
        body: JSON.stringify({ source: 'firebase-scheduler', time: event.scheduleTime }),
      });

      const result = await response.json();
      console.log('[syncDeals] Sync result:', result);

      return { ok: true, result };
    } catch (error) {
      console.error('[syncDeals] Sync failed:', error);
      throw error;
    }
  }
);

/**
 * Scheduled function: Runs every 6 hours to sync Amazon deals specifically.
 * Updates prices, in-stock status, and verifies affiliate tags.
 */
export const syncAmazonDeals = onSchedule(
  {
    schedule: 'every 6 hours',
    timeZone: 'Asia/Kolkata',
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async (event: ScheduledEvent) => {
    console.log('[syncAmazonDeals] Starting Amazon deal sync...', event.scheduleTime);

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app';
      const secret = process.env.CRON_SECRET || 'muddapappu-secret';

      const response = await fetch(`${siteUrl}/api/cron/amazon-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`,
        },
        body: JSON.stringify({ source: 'firebase-amazon-scheduler', time: event.scheduleTime }),
      });

      const result = await response.json();
      console.log('[syncAmazonDeals] Sync result:', result);

      return { ok: true, result };
    } catch (error) {
      console.error('[syncAmazonDeals] Sync failed:', error);
      throw error;
    }
  }
);

/**
 * HTTP callable function: Manual trigger for deal sync on demand.
 */
export const manualSync = functions.https.onCall(async (request: CallableRequest) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && request.data?.secret !== adminSecret) {
    throw new functions.https.HttpsError('unauthenticated', 'Invalid admin secret');
  }

  console.log('[manualSync] Manual sync triggered');

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app';
    const secret = process.env.CRON_SECRET || 'muddapappu-secret';

    const response = await fetch(`${siteUrl}/api/cron/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify({ source: 'manual', time: new Date().toISOString() }),
    });

    const result = await response.json();
    return { ok: true, result };
  } catch (error) {
    console.error('[manualSync] Failed:', error);
    throw new functions.https.HttpsError('internal', 'Sync failed');
  }
});
