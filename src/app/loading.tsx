import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative">
          {/* Outer ring */}
          <div className="w-24 h-24 rounded-full border-4 border-bmv-primary/20 animate-pulse" />

          {/* Spinning ring */}
          <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-bmv-primary animate-spin" />

          {/* Logo center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-bmv-primary rounded-xl flex items-center justify-center shadow-lg animate-pulse-soft">
              <Image
                src="/logo.png"
                alt="BM&V Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="mt-8">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Carregando
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="w-2 h-2 bg-bmv-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-bmv-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-bmv-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
