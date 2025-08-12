"use client"

import { useState } from "react"
import { purchaseBooks } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, CheckCircle } from "lucide-react"

interface CartItem {
  id: string
  title: string
  author: string
  price: number
  quantity: number
}

interface CartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onClearCart: () => void
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onClearCart }: CartProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleQuantityChange = (id: string, change: number) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change)
      onUpdateQuantity(id, newQuantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    onUpdateQuantity(id, 0)
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    })
  }

  const handlePurchase = async () => {
    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before purchasing",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)

    try {
      // Prepare purchase data
      const purchaseItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }))

      // Attempt to purchase (this will reduce stock atomically)
      await purchaseBooks(purchaseItems)

      // Show success animation
      setShowSuccess(true)

      // Clear cart after successful purchase
      onClearCart()

      toast({
        title: "Purchase Successful!",
        description: `Your order of ${items.length} item${items.length !== 1 ? "s" : ""} has been processed successfully`,
      })

      // Hide success animation after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 3000)
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred during purchase",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleClearCart = () => {
    onClearCart()
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg bg-gray-900 border-gray-700">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Cart ({items.length} items)
            </SheetTitle>
            <SheetDescription className="text-gray-300">Review your items and proceed to checkout</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
                <p className="text-gray-400">Add some books to get started</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium line-clamp-1">{item.title}</h4>
                            <p className="text-gray-400 text-sm">by {item.author}</p>
                            <p className="text-white font-semibold mt-1">${item.price.toFixed(2)} each</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 p-0 border-gray-600 text-white hover:bg-gray-700"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Badge variant="secondary" className="bg-gray-700 text-white px-3">
                              {item.quantity}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 p-0 border-gray-600 text-white hover:bg-gray-700"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="bg-gray-700" />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax (8%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                        disabled={isPurchasing}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {isPurchasing ? "Processing..." : `Purchase - $${total.toFixed(2)}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Confirm Purchase</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Are you sure you want to purchase {items.length} item{items.length !== 1 ? "s" : ""} for a
                          total of ${total.toFixed(2)}? This action will reduce the available stock.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handlePurchase}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={isPurchasing}
                        >
                          {isPurchasing ? "Processing..." : "Confirm Purchase"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        Clear Cart
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Clear Cart</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          Are you sure you want to remove all items from your cart? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearCart} className="bg-red-600 hover:bg-red-700 text-white">
                          Clear Cart
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-green-600 border-green-500 text-white animate-pulse">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold mb-2">Purchase Successful!</h3>
              <p className="text-green-100">Thank you for your order</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Toaster />
    </>
  )
}
