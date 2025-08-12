import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Check if we're in development and use emulator, otherwise use a proper config
const firebaseConfig = {
  // For production, you'll need to replace these with your actual Firebase config
  // For now, using environment variables that should be set in your Vercel project
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-bookstore-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  try {
    // Only connect to emulator if we haven't already connected
    if (!db._delegate._databaseId.projectId.includes("demo")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }
  } catch (error) {
    // Emulator connection might fail if not running, that's okay
    console.log("Firestore emulator not available, using live database")
  }
}
