import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  price: number
  stock: number
  category: string
  createdAt: Date
}

const BOOKS_COLLECTION = "books"

// Add a new book
export const addBook = async (bookData: Omit<Book, "id" | "createdAt">) => {
  try {
    const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
      ...bookData,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding book:", error)
    throw new Error("Failed to add book. Please check your connection and try again.")
  }
}

// Update a book
export const updateBook = async (id: string, bookData: Partial<Omit<Book, "id" | "createdAt">>) => {
  try {
    const bookRef = doc(db, BOOKS_COLLECTION, id)
    await updateDoc(bookRef, bookData)
  } catch (error) {
    console.error("Error updating book:", error)
    throw new Error("Failed to update book. Please check your connection and try again.")
  }
}

// Delete a book
export const deleteBook = async (id: string) => {
  try {
    await deleteDoc(doc(db, BOOKS_COLLECTION, id))
  } catch (error) {
    console.error("Error deleting book:", error)
    throw new Error("Failed to delete book. Please check your connection and try again.")
  }
}

// Get all books
export const getBooks = async (): Promise<Book[]> => {
  try {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Book[]
  } catch (error) {
    console.error("Error getting books:", error)
    throw new Error("Failed to fetch books. Please check your connection and try again.")
  }
}

// Subscribe to books changes (real-time updates)
export const subscribeToBooks = (callback: (books: Book[]) => void, onError?: (error: Error) => void) => {
  try {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy("createdAt", "desc"))
    return onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const books = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as Book[]
          callback(books)
        } catch (error) {
          console.error("Error processing book data:", error)
          if (onError) {
            onError(new Error("Failed to process book data"))
          }
        }
      },
      (error) => {
        console.error("Error in real-time subscription:", error)
        if (onError) {
          onError(new Error("Connection lost. Please check your internet connection and Firebase configuration."))
        }
      },
    )
  } catch (error) {
    console.error("Error setting up real-time subscription:", error)
    if (onError) {
      onError(new Error("Failed to establish real-time connection"))
    }
    // Return a no-op unsubscribe function
    return () => {}
  }
}

// Purchase books (reduce stock atomically)
export const purchaseBooks = async (items: Array<{ id: string; quantity: number }>) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Read all book documents first
      const bookRefs = items.map((item) => doc(db, BOOKS_COLLECTION, item.id))
      const bookDocs = await Promise.all(bookRefs.map((ref) => transaction.get(ref)))

      // Check if all books have sufficient stock
      for (let i = 0; i < bookDocs.length; i++) {
        const bookDoc = bookDocs[i]
        const item = items[i]

        if (!bookDoc.exists()) {
          throw new Error(`Book with ID ${item.id} not found`)
        }

        const currentStock = bookDoc.data().stock
        if (currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${bookDoc.data().title}". Available: ${currentStock}, Requested: ${item.quantity}`,
          )
        }
      }

      // Update all book stock atomically
      for (let i = 0; i < bookRefs.length; i++) {
        const bookRef = bookRefs[i]
        const item = items[i]
        transaction.update(bookRef, {
          stock: increment(-item.quantity),
        })
      }
    })
  } catch (error) {
    console.error("Error purchasing books:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to complete purchase. Please try again.")
  }
}
