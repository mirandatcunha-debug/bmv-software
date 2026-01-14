import { DashboardLayoutClient } from '@/components/layout/dashboard-layout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { MasterProvider } from '@/contexts/MasterContext'
import { ViewingBanner } from '@/components/layout/ViewingBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MasterProvider>
      <ViewingBanner />
      <DashboardLayoutClient>
        <ErrorBoundary>{children}</ErrorBoundary>
      </DashboardLayoutClient>
    </MasterProvider>
  )
}
