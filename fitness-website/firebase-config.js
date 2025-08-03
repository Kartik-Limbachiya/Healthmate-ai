// firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAthQ2oIZPyC3s8JcHfyWyzV9wCuG52YDE",
  authDomain: "healthmate-2004.firebaseapp.com",
  projectId: "healthmate-2004",
  storageBucket: "healthmate-2004.firebasestorage.app",
  messagingSenderId: "513162731414",
  appId: "1:513162731414:web:2bc9fcbf74d2097fb8c7b7"
};
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app)
const db = getFirestore(app)
/*const storage = getStorage(app)*/
const rtdb = getDatabase(app)


export { auth, db, /*storage*/ rtdb }
