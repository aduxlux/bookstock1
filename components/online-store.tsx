"use client"

import { useState, useEffect } from "react"
import { type Book, subscribeToBooks } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, ShoppingCart, BookOpen, Star, Filter, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OnlineStoreProps {
  onAddToCart: (book: { id: string; title: string; author: string; price: number }) => void
}

type SortOption = "title" | "author" | "price-low" | "price-high" | "stock"

export function OnlineStore({ onAddToCart }: OnlineStoreProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("title")
  const [isLoading, setIsLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToBooks(
      (updatedBooks) => {
        // Only show books that are in stock for the store
        const availableBooks = updatedBooks.filter((book) => book.quantity > 0)
        setBooks(availableBooks)
        setIsLoading(false)
        setConnectionError(null)
      },
      (error) => {
        setConnectionError("Connection to database lost. Retrying...")
        toast({
          title: "Connection Issue",
          description: "Real-time updates temporarily unavailable",
          variant: "destructive",
        })
      },
    )

    return () => unsubscribe()
  }, [toast])

  // Filter and sort books
  useEffect(() => {
    let filtered = books

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "stock":
          return b.quantity - a.quantity
        default:
          return 0
      }
    })

    setFilteredBooks(filtered)
  }, [books, searchTerm, sortBy])

  const handleAddToCart = (book: Book) => {
    if (book.quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `"${book.title}" is currently out of stock`,
        variant: "destructive",
      })
      return
    }

    onAddToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
    })

    toast({
      title: "Added to Cart",
      description: `"${book.title}" has been added to your cart`,
    })
  }

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (quantity < 5) {
      return <Badge className="bg-yellow-600 text-white">Low Stock ({quantity})</Badge>
    }
    return <Badge className="bg-green-600 text-white">In Stock ({quantity})</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Browse Our Collection</h2>
        <p className="text-white/80">Discover your next great read from our curated selection</p>
        {connectionError && (
          <div className="mt-2 flex items-center justify-center gap-2 text-yellow-300">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{connectionError}</span>
          </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="text-white/70 w-4 h-4" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="title" className="text-white hover:bg-gray-800">
                    Sort by Title
                  </SelectItem>
                  <SelectItem value="author" className="text-white hover:bg-gray-800">
                    Sort by Author
                  </SelectItem>
                  <SelectItem value="price-low" className="text-white hover:bg-gray-800">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high" className="text-white hover:bg-gray-800">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="stock" className="text-white hover:bg-gray-800">
                    Sort by Stock
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-white text-lg">Loading our collection...</div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No books found" : "No books available"}
            </h3>
            <p className="text-white/70">
              {searchTerm
                ? "Try adjusting your search terms or browse all available books"
                : "Check back later for new arrivals"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-white/80">
              Showing {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg line-clamp-2 mb-1">{book.title}</CardTitle>
                      <CardDescription className="text-white/70 text-sm">by {book.author}</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">4.5</span>
                    </div>
                  </div>
                  {getStockBadge(book.quantity)}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-white">${book.price.toFixed(2)}</div>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(book)}
                    disabled={book.quantity <= 0}
                    className={`w-full transition-all duration-300 ${
                      book.quantity <= 0
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                    } text-white`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {book.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>

                  {book.quantity > 0 && book.quantity < 5 && (
                    <p className="text-yellow-300 text-xs mt-2 text-center">Only {book.quantity} left in stock!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Toaster />
    </div>
  )
}
