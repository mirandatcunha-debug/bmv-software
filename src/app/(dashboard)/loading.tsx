export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full">
        {/* Logo area */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Navigation skeleton */}
        <div className="p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div
                className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* More items */}
        <div className="p-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ animationDelay: `${(i + 6) * 100}ms` }}
            >
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div
                className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                style={{ width: `${50 + Math.random() * 30}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pl-64 flex-1">
        {/* Header Skeleton */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="p-6">
          {/* Page title */}
          <div className="mb-8">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Main content area skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Side card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
