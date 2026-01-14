const SUPERADMIN_EMAILS = [
  't.master@admin.com',
  'e.master@admin.com'
]

export function isSuperAdminEmail(email: string): boolean {
  return SUPERADMIN_EMAILS.includes(email.toLowerCase())
}
