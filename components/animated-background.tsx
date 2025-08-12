"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-yellow-900 to-black" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 -left-40 w-60 h-60 bg-yellow-500/10 rounded-full blur-xl animate-pulse animation-delay-1000" />
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-xl animate-pulse animation-delay-2000" />
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-yellow-600/10 rounded-full blur-xl animate-pulse animation-delay-3000" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fillRule=%22evenodd%22%3E%3Cg fill=%22%23fbbf24%22 fillOpacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse" />
    </div>
  )
}
