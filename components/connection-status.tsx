"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setIsConnected(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsConnected(false)
    }

    // Check initial connection status
    setIsOnline(navigator.onLine)

    // Listen for connection changes
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Simulate Firebase connection monitoring
    const connectionCheck = setInterval(() => {
      if (navigator.onLine) {
        setIsConnected(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(connectionCheck)
    }
  }, [])

  if (isOnline && isConnected) {
    return (
      <Badge className="bg-green-600 text-white flex items-center gap-1">
        <Wifi className="w-3 h-3" />
        Live Updates Active
      </Badge>
    )
  }

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <WifiOff className="w-3 h-3" />
      {!isOnline ? "Offline" : "Connection Issues"}
    </Badge>
  )
}
