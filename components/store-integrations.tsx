"use client"

import type React from "react"
import { RefreshCw } from "lucide-react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, ExternalLink, Settings, Zap, ShoppingBag, Globe } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
  description: string
  features: string[]
}

export function StoreIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "shopify",
      name: "Shopify",
      icon: <ShoppingBag className="w-6 h-6" />,
      connected: false,
      description: "Sync inventory with your Shopify store",
      features: ["Real-time stock sync", "Product management", "Order tracking", "Multi-location support"],
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      icon: <Globe className="w-6 h-6" />,
      connected: false,
      description: "Connect to your WordPress WooCommerce store",
      features: ["Inventory sync", "Product updates", "Category management", "Bulk operations"],
    },
    {
      id: "square",
      name: "Square",
      icon: <Zap className="w-6 h-6" />,
      connected: true,
      description: "Integrate with Square POS and online store",
      features: ["POS integration", "Online store sync", "Payment tracking", "Customer data"],
    },
  ])

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [storeUrl, setStoreUrl] = useState("")
  const [autoSync, setAutoSync] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")

  const handleConnect = async (integrationId: string) => {
    if (!apiKey || !storeUrl) return

    setSyncStatus("syncing")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? { ...integration, connected: true } : integration,
        ),
      )

      setSyncStatus("success")
      setSelectedIntegration(null)
      setApiKey("")
      setStoreUrl("")

      setTimeout(() => setSyncStatus("idle"), 3000)
    } catch (error) {
      setSyncStatus("error")
      setTimeout(() => setSyncStatus("idle"), 3000)
    }
  }

  const handleDisconnect = (integrationId: string) => {
    if (confirm("Are you sure you want to disconnect this store? This will stop all syncing.")) {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId ? { ...integration, connected: false } : integration,
        ),
      )
    }
  }

  const handleManualSync = async (integrationId: string) => {
    setSyncStatus("syncing")
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSyncStatus("success")
      setTimeout(() => setSyncStatus("idle"), 2000)
    } catch (error) {
      setSyncStatus("error")
      setTimeout(() => setSyncStatus("idle"), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Store Integrations</h2>
        <p className="text-yellow-200/80 mb-4">
          Connect your inventory to external stores for seamless stock management
        </p>

        <Alert className="bg-yellow-500/20 border-yellow-400/30 mb-6">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-100">
            Stock levels will automatically sync across all connected platforms when enabled.
            {syncStatus === "syncing" && " Syncing in progress..."}
            {syncStatus === "success" && " ✓ Sync completed successfully!"}
            {syncStatus === "error" && " ✗ Sync failed. Please check your connection."}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="platforms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20">
            <TabsTrigger value="platforms" className="text-yellow-200 data-[state=active]:bg-yellow-400/20">
              Platforms
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-yellow-200 data-[state=active]:bg-yellow-400/20">
              Sync Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-yellow-400">{integration.icon}</div>
                        <div>
                          <CardTitle className="text-yellow-200 text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {integration.connected ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500/20 text-gray-400 border-gray-400/30">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Not Connected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-yellow-200/70">{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-200 mb-2">Features:</h4>
                        <ul className="text-xs text-yellow-200/70 space-y-1">
                          {integration.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-yellow-400/50 rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        {integration.connected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(integration.id)}
                              className="flex-1 bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                            >
                              Disconnect
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManualSync(integration.id)}
                              disabled={syncStatus === "syncing"}
                              className="bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30"
                            >
                              {syncStatus === "syncing" ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <ExternalLink className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedIntegration(integration)}
                                className="flex-1 bg-yellow-500/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-500/30"
                              >
                                Connect
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900/95 backdrop-blur-sm border-yellow-400/20">
                              <DialogHeader>
                                <DialogTitle className="text-yellow-400 flex items-center gap-2">
                                  {integration.icon}
                                  Connect to {integration.name}
                                </DialogTitle>
                                <DialogDescription className="text-yellow-200/70">
                                  Enter your {integration.name} credentials to sync your inventory
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="store-url" className="text-yellow-200">
                                    Store URL
                                  </Label>
                                  <Input
                                    id="store-url"
                                    placeholder={`your-store.${integration.id === "shopify" ? "myshopify.com" : "com"}`}
                                    value={storeUrl}
                                    onChange={(e) => setStoreUrl(e.target.value)}
                                    className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 placeholder:text-yellow-200/50"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="api-key" className="text-yellow-200">
                                    API Key
                                  </Label>
                                  <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="Enter your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    className="bg-yellow-400/10 border-yellow-400/20 text-yellow-200 placeholder:text-yellow-200/50"
                                  />
                                </div>
                                <Button
                                  onClick={() => handleConnect(integration.id)}
                                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium"
                                  disabled={!apiKey || !storeUrl || syncStatus === "syncing"}
                                >
                                  {syncStatus === "syncing" ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Connecting...
                                    </>
                                  ) : (
                                    `Connect ${integration.name}`
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Synchronization Settings
                </CardTitle>
                <CardDescription className="text-yellow-200/70">
                  Configure how your inventory syncs across platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-yellow-200 font-medium">Auto-sync inventory</Label>
                    <p className="text-sm text-yellow-200/70">Automatically update stock levels across all platforms</p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-yellow-200 font-medium">Low stock alerts</Label>
                    <p className="text-sm text-yellow-200/70">Get notified when inventory runs low</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-yellow-200 font-medium">Price sync</Label>
                    <p className="text-sm text-yellow-200/70">Sync price changes across platforms</p>
                  </div>
                  <Switch />
                </div>

                <div className="pt-4 border-t border-yellow-400/20">
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
