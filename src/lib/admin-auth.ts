export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'changeme-muddapappu';
}

export const ADMIN_PASSWORD = getAdminPassword();