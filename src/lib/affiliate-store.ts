/**
 * Affiliate Config persistence layer.
 * 
 * This module provides a way to persist affiliate configuration across Vercel's
 * ephemeral filesystem. It uses:
 * 
 * 1. File system (local development or Vercel with build cache)
 * 2. GitHub API (when GITHUB_PAT or GITHUB_TOKEN is set in Vercel environment)
 * 
 * The config is stored in data/store/affiliate-config.json in git, so it's always
 * available as a fallback during deployments.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { StoreId } from './types';

export type AffiliateConfig = {
  [store in StoreId]: { tag: string; useCuelinks: boolean };
};

const CONFIG_PATH = path.join(process.cwd(), 'data', 'store', 'affiliate-config.json');

// Default config for all stores
export function getDefaultConfig(): AffiliateConfig {
  const stores: StoreId[] = ['amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zomato', 'zepto', 'bigbasket'];
  const config = {} as AffiliateConfig;
  for (const store of stores) {
    config[store] = { tag: 'muddapappu', useCuelinks: true };
  }
  return config;
}

export async function loadAffiliateConfig(): Promise<AffiliateConfig> {
  // Try file system first
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    // File doesn't exist, return default
  }

  // Return default config
  return getDefaultConfig();
}

export async function saveAffiliateConfig(config: AffiliateConfig): Promise<void> {
  const timestamp = new Date().toISOString();

  // Save to file system
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));

  // Persist to GitHub if token is available
  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  if (githubToken) {
    try {
      await persistToGitHub(config, timestamp, githubToken);
    } catch (e) {
      console.error('Failed to persist to GitHub:', e);
    }
  }
}

async function persistToGitHub(config: AffiliateConfig, timestamp: string, token: string): Promise<void> {
  const GITHUB_REPO = 'lalithchary/muddapappu';
  const content = JSON.stringify(config, null, 2);
  const encodedContent = Buffer.from(content).toString('base64');

  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  // Get current file SHA if it exists
  let sha: string | null = null;
  try {
    const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
      headers,
    });
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      sha = fileData.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  // Update the file
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Update affiliate config - ${timestamp}`,
      content: encodedContent,
      sha,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${text}`);
  }
}