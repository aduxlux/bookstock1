"use client"

import { BookManagement } from "@/components/book-management"
import { StoreIntegrations } from "@/components/store-integrations"
import { Analytics } from "@/components/analytics"
import { AnimatedBackground } from "@/components/animated-background"
import { ConnectionStatus } from "@/components/connection-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Link, BarChart3, Warehouse } from "lucide-react"

export default function BookstoreApp() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-2xl">
              <Warehouse className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 drop-shadow-lg">Stock Manager Pro</h1>
          </div>
          <p className="text-xl text-yellow-200/90 drop-shadow-md">
            Advanced inventory management with external store integration
          </p>
          <div className="flex justify-center mt-4">
            <ConnectionStatus />
          </div>
        </header>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20">
            <TabsTrigger
              value="inventory"
              className="flex items-center gap-2 text-yellow-200 data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-100"
            >
              <Package className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="flex items-center gap-2 text-yellow-200 data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-100"
            >
              <Link className="w-4 h-4" />
              Store Links
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 text-yellow-200 data-[state=active]:bg-yellow-400/20 data-[state=active]:text-yellow-100"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-6">
            <BookManagement />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <StoreIntegrations />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
