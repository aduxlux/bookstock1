"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type Book, addBook, updateBook, deleteBook, subscribeToBooks } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, BookOpen, DollarSign, Package } from "lucide-react"

interface BookFormData {
  title: string
  author: string
  quantity: string
  price: string
}

interface FormErrors {
  title?: string
  author?: string
  quantity?: string
  price?: string
}

export function BookManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    quantity: "",
    price: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToBooks((updatedBooks) => {
      setBooks(updatedBooks)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Filter books based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBooks(books)
    } else {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredBooks(filtered)
    }
  }, [books, searchTerm])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    // Author validation
    if (!formData.author.trim()) {
      newErrors.author = "Author is required"
    }

    // Quantity validation
    const quantity = Number.parseInt(formData.quantity)
    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required"
    } else if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = "Quantity must be a non-negative integer"
    }

    // Price validation
    const price = Number.parseFloat(formData.price)
    if (!formData.price.trim()) {
      newErrors.price = "Price is required"
    } else if (isNaN(price) || price < 0) {
      newErrors.price = "Price must be a non-negative number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        quantity: Number.parseInt(formData.quantity),
        price: Number.parseFloat(formData.price),
      }

      if (editingBook) {
        await updateBook(editingBook.id, bookData)
        toast({
          title: "Book Updated",
          description: `"${bookData.title}" has been updated successfully`,
        })
        setEditingBook(null)
      } else {
        await addBook(bookData)
        toast({
          title: "Book Added",
          description: `"${bookData.title}" has been added to inventory`,
        })
      }

      // Reset form
      setFormData({ title: "", author: "", quantity: "", price: "" })
      setErrors({})
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      quantity: book.quantity.toString(),
      price: book.price.toString(),
    })
    setErrors({})
  }

  // Handle delete
  const handleDelete = async (book: Book) => {
    try {
      await deleteBook(book.id)
      toast({
        title: "Book Deleted",
        description: `"${book.title}" has been removed from inventory`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingBook(null)
    setFormData({ title: "", author: "", quantity: "", price: "" })
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Book Form */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingBook ? "Update Book" : "Add New Book"}
          </CardTitle>
          <CardDescription className="text-white/70">
            {editingBook ? "Update the book information below" : "Fill in the details to add a new book to inventory"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter book title"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              {errors.title && <p className="text-red-300 text-sm">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="text-white">
                Author *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Enter author name"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              {errors.author && <p className="text-red-300 text-sm">{errors.author}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-white">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              {errors.quantity && <p className="text-red-300 text-sm">{errors.quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-white">
                Price ($) *
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              {errors.price && <p className="text-red-300 text-sm">{errors.price}</p>}
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
              >
                {isSubmitting ? "Processing..." : editingBook ? "Update Book" : "Add Book"}
              </Button>
              {editingBook && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <Input
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Book Inventory ({filteredBooks.length} books)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-white">Loading books...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              {searchTerm ? "No books found matching your search" : "No books in inventory"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white">Title</TableHead>
                    <TableHead className="text-white">Author</TableHead>
                    <TableHead className="text-white">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Quantity
                      </div>
                    </TableHead>
                    <TableHead className="text-white">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Price
                      </div>
                    </TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <TableRow key={book.id} className="border-white/20 hover:bg-white/5 transition-colors">
                      <TableCell className="text-white font-medium">{book.title}</TableCell>
                      <TableCell className="text-white/80">{book.author}</TableCell>
                      <TableCell>
                        <Badge
                          variant={book.quantity === 0 ? "destructive" : book.quantity < 5 ? "secondary" : "default"}
                          className={
                            book.quantity === 0
                              ? "bg-red-600 text-white"
                              : book.quantity < 5
                                ? "bg-yellow-600 text-white"
                                : "bg-green-600 text-white"
                          }
                        >
                          {book.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">${book.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(book)}
                            className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-400/50 text-red-300 hover:bg-red-600/20 transition-all duration-300 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Book</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to delete "{book.title}" by {book.author}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(book)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}
