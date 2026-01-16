import { DashboardLayoutClient } from '@/components/layout/dashboard-layout'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { MasterProvider } from '@/contexts/MasterContext'
import { ViewingBanner } from '@/components/layout/ViewingBanner'
import { TrialBanner } from '@/components/layout/TrialBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MasterProvider>
      <ViewingBanner />
      <TrialBanner />
      <DashboardLayoutClient>
        <ErrorBoundary>{children}</ErrorBoundary>
      </DashboardLayoutClient>
    </MasterProvider>
  )
}
