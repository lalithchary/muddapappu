export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'change-me';
}

export const ADMIN_PASSWORD = getAdminPassword();