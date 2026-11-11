"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualSync = exports.syncAmazonDeals = exports.syncDeals = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const v2_1 = require("firebase-functions/v2");
// Set global options for all functions
(0, v2_1.setGlobalOptions)({ region: 'us-central1', maxInstances: 10, memory: '512MiB', cpu: 1, timeoutSeconds: 300 });
/**
 * Scheduled function: Runs every 30 minutes to sync deals from Cuelinks API.
 * This is the equivalent of a Vercel cron job.
 *
 * Configure in Firebase Console:
 *   Functions → SyncDeals → Edit → Triggers → Scheduled
 * Or update via CLI:
 *   firebase deploy functions:syncDeals --schedule "every 30 minutes"
 */
exports.syncDeals = (0, scheduler_1.onSchedule)({
    schedule: 'every 30 minutes',
    timeZone: 'Asia/Kolkata',
    memory: '512MiB',
    timeoutSeconds: 300,
}, async (context) => {
    console.log('[syncDeals] Starting scheduled deal sync...', context.time);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app'}/api/cron/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || 'muddapappu-secret'}`,
            },
            body: JSON.stringify({ source: 'firebase-scheduler', time: context.time }),
        });
        const result = await response.json();
        console.log('[syncDeals] Sync result:', result);
        return { ok: true, result };
    }
    catch (error) {
        console.error('[syncDeals] Sync failed:', error);
        throw error;
    }
});
/**
 * Scheduled function: Runs every 6 hours to sync Amazon deals specifically.
 * This targets Amazon products and updates prices/stock.
 */
exports.syncAmazonDeals = (0, scheduler_1.onSchedule)({
    schedule: 'every 6 hours',
    timeZone: 'Asia/Kolkata',
    memory: '512MiB',
    timeoutSeconds: 600,
}, async (context) => {
    console.log('[syncAmazonDeals] Starting Amazon deal sync...', context.time);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app'}/api/cron/amazon-sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || 'muddapappu-secret'}`,
            },
            body: JSON.stringify({ source: 'firebase-amazon-scheduler', time: context.time }),
        });
        const result = await response.json();
        console.log('[syncAmazonDeals] Sync result:', result);
        return { ok: true, result };
    }
    catch (error) {
        console.error('[syncAmazonDeals] Sync failed:', error);
        throw error;
    }
});
/**
 * HTTP callable function: Manual trigger for deal sync.
 * Call from admin panel to sync deals on demand.
 */
exports.manualSync = functions.https.onCall(async (data, context) => {
    // Optional: Check admin auth
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret && data.secret !== adminSecret) {
        throw new functions.https.HttpsError('unauthenticated', 'Invalid admin secret');
    }
    console.log('[manualSync] Manual sync triggered');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://muddapappu.web.app'}/api/cron/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || 'muddapappu-secret'}`,
            },
            body: JSON.stringify({ source: 'manual', time: new Date().toISOString() }),
        });
        const result = await response.json();
        return { ok: true, result };
    }
    catch (error) {
        console.error('[manualSync] Failed:', error);
        throw new functions.https.HttpsError('internal', 'Sync failed');
    }
});
