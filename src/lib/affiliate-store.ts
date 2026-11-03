/**
 * Affiliate Config persistence layer.
 * 
 * This module provides a way to persist affiliate configuration across Vercel's
 * ephemeral filesystem. Due to Vercel's read-only filesystem in Serverless Functions,
 * this module:
 * 
 * 1. Loads config from the embedded copy (built at deploy time)
 * 2. Commits changes to GitHub via API (when GITHUB_PAT is set in Vercel)
 * 
 * The config is stored in data/store/affiliate-config.json in git, and is
 * copied into the app at build time for reading.
 */

import type { StoreId } from './types';

export type AffiliateConfig = {
  [store in StoreId]: { tag: string; useCuelinks: boolean };
};

// Default config for all stores - used when no config file is available
export function getDefaultConfig(): AffiliateConfig {
  const stores: StoreId[] = ['amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'zomato', 'zepto', 'bigbasket'];
  const config = {} as AffiliateConfig;
  for (const store of stores) {
    config[store] = { tag: 'muddapappu', useCuelinks: true };
  }
  return config;
}

// In-memory cache to avoid repeated GitHub API calls
let cachedConfig: AffiliateConfig | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function loadAffiliateConfig(): Promise<AffiliateConfig> {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - cacheTime) < CACHE_TTL) {
    return cachedConfig;
  }

  // Try to load from embedded config at build time
  try {
    // At build time, the config is copied into the .next/server/BUILD_DIR
    // For Vercel, we need to fetch from GitHub
    const config = await fetchConfigFromGitHub();
    cachedConfig = config;
    cacheTime = now;
    return config;
  } catch {
    // Return default config as fallback
    return getDefaultConfig();
  }
}

async function fetchConfigFromGitHub(): Promise<AffiliateConfig> {
  const GITHUB_REPO = 'lalithchary/muddapappu';
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    // If file doesn't exist in repo yet, return default
    if (response.status === 404) {
      return getDefaultConfig();
    }
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return JSON.parse(content);
}

export async function saveAffiliateConfig(config: AffiliateConfig): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Persist to GitHub if token is available
  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  if (githubToken) {
    await persistToGitHub(config, timestamp, githubToken);
  } else {
    // Cache locally if no GitHub token (session-only persistence)
    cachedConfig = config;
    cacheTime = Date.now();
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

  // Update the file with retry logic for concurrent modifications
  const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Update affiliate config via admin - ${timestamp}`,
      content: encodedContent,
      sha,
    }),
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    
    // Handle 409 Conflict - file was modified since we read it
    if (updateResponse.status === 409 && sha) {
      try {
        // Get fresh content, merge changes, and retry
        const currentRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
          headers,
        });
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          // Merge: apply current config as base, then overlay admin changes
          // This ensures admin changes take precedence
          const content = Buffer.from(currentData.content, 'base64').toString('utf8');
          const currentConfig = JSON.parse(content);
          
          // Merge: current values as base, new values override
          const mergedConfig = { ...currentConfig, ...config };
          
          const mergedContent = JSON.stringify(mergedConfig, null, 2);
          const mergedEncoded = Buffer.from(mergedContent).toString('base64');
          
          const retryResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/data/store/affiliate-config.json`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              message: `Update affiliate config via admin (merged) - ${timestamp}`,
              content: mergedEncoded,
              sha: currentData.sha,
            }),
          });

          if (retryResponse.ok) {
            // Update cache with merged config
            cachedConfig = mergedConfig;
            cacheTime = Date.now();
            return;
          }
        }
      } catch (mergeError) {
        console.error('Merge failed:', mergeError);
      }
    }
    
    throw new Error(`GitHub API error: ${updateResponse.status} ${errorText}`);
  }

  // Update cache
  cachedConfig = config;
  cacheTime = Date.now();
}