"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
} from "lucide-react"
import { subscribeToBooks } from "@/lib/firestore"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  price: number
  stock: number
  category: string
  createdAt: any
}

interface AnalyticsData {
  totalBooks: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  topCategories: { category: string; count: number; value: number }[]
  recentActivity: { type: string; book: string; timestamp: Date; id: string }[]
}

export function Analytics() {
  const [books, setBooks] = useState<Book[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBooks: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    topCategories: [],
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = subscribeToBooks((booksData) => {
        setBooks(booksData)
        calculateAnalytics(booksData)
        setLoading(false)
        setError(null)
      })
    } catch (err) {
      console.error("Failed to subscribe to books:", err)
      setError("Failed to connect to database. Please check your Firebase configuration.")
      setLoading(false)
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const calculateAnalytics = (booksData: Book[]) => {
    const totalBooks = booksData.length
    const totalValue = booksData.reduce((sum, book) => sum + book.price * book.stock, 0)
    const lowStockItems = booksData.filter((book) => book.stock > 0 && book.stock <= 5).length
    const outOfStockItems = booksData.filter((book) => book.stock === 0).length

    // Calculate top categories
    const categoryMap = new Map<string, { count: number; value: number }>()
    booksData.forEach((book) => {
      const existing = categoryMap.get(book.category) || { count: 0, value: 0 }
      categoryMap.set(book.category, {
        count: existing.count + 1,
        value: existing.value + book.price * book.stock,
      })
    })

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const recentActivity = [
      {
        type: "stock_update",
        book: "Sample Book",
        timestamp: new Date(),
        id: "activity-1",
      },
      {
        type: "new_book",
        book: "Another Book",
        timestamp: new Date(Date.now() - 3600000),
        id: "activity-2",
      },
      {
        type: "low_stock",
        book: "Popular Book",
        timestamp: new Date(Date.now() - 7200000),
        id: "activity-3",
      },
    ]

    setAnalytics({
      totalBooks,
      totalValue,
      lowStockItems,
      outOfStockItems,
      topCategories,
      recentActivity,
    })
  }

  const refreshData = () => {
    setLoading(true)
    calculateAnalytics(books)
    setTimeout(() => setLoading(false), 1000)
  }

  if (error) {
    return (
      <div className="bg-red-400/10 backdrop-blur-sm border border-red-400/20 rounded-lg p-6">
        <div className="flex items-center justify-center text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
          <div>
            <p className="text-red-400 font-medium">Connection Error</p>
            <p className="text-red-200/80 text-sm mt-1">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="mt-3 bg-red-400/20 border-red-400/30 text-red-400 hover:bg-red-400/30"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin mr-2" />
          <span className="text-yellow-200">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Analytics Dashboard</h2>
            <p className="text-yellow-200/80">Real-time insights into your inventory performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-yellow-400/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20">
            <TabsTrigger value="overview" className="text-yellow-200 data-[state=active]:bg-yellow-400/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-yellow-200 data-[state=active]:bg-yellow-400/20">
              Categories
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-yellow-200 data-[state=active]:bg-yellow-400/20">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-200">Total Books</CardTitle>
                  <Package className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{analytics.totalBooks}</div>
                  <p className="text-xs text-yellow-200/70">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Active inventory items
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-200">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">${analytics.totalValue.toFixed(2)}</div>
                  <p className="text-xs text-yellow-200/70">
                    <TrendingUp className="inline h-3 w-3 mr-1" />
                    Current inventory value
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-200">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-400">{analytics.lowStockItems}</div>
                  <p className="text-xs text-yellow-200/70">Items with ≤5 units</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-200">Out of Stock</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{analytics.outOfStockItems}</div>
                  <p className="text-xs text-yellow-200/70">Items needing restock</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Categories by Value
                </CardTitle>
                <CardDescription className="text-yellow-200/70">
                  Categories ranked by total inventory value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topCategories.map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium text-yellow-200">{category.category}</p>
                          <p className="text-sm text-yellow-200/70">{category.count} books</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-400">${category.value.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="bg-yellow-400/10 backdrop-blur-sm border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-yellow-400">Recent Activity</CardTitle>
                <CardDescription className="text-yellow-200/70">Latest inventory changes and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-yellow-400/5 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      <div className="flex-1">
                        <p className="text-yellow-200">
                          {activity.type === "stock_update" && "Stock updated for "}
                          {activity.type === "new_book" && "New book added: "}
                          {activity.type === "low_stock" && "Low stock alert for "}
                          <span className="font-medium">{activity.book}</span>
                        </p>
                        <p className="text-xs text-yellow-200/70">{activity.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
