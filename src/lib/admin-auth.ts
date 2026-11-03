export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'Cockr0@ch@2026';
}

export const ADMIN_PASSWORD = getAdminPassword();

/** Allowed default passwords (for quick fallback when env not set) */
export const ADMIN_DEFAULT_PASSWORD = 'Cockr0@ch@2026';