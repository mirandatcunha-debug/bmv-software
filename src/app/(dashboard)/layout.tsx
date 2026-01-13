import { DashboardLayoutClient } from '@/components/layout/dashboard-layout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutClient><ErrorBoundary>{children}</ErrorBoundary></DashboardLayoutClient>
}
