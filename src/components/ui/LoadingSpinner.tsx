export function LoadingSpinner({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-gray-200 border-t-[#1E3A5F] rounded-full animate-spin`} />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  )
}
