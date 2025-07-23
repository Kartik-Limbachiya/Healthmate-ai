// firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7wvfc0qig_oC3F6ZhYaUpk18Pu6MeLyA",
  authDomain: "healthmate-93d2c.firebaseapp.com",
  projectId: "healthmate-93d2c",
  storageBucket: "healthmate-93d2c.firebasestorage.app",
  messagingSenderId: "822469032869",
  appId: "1:822469032869:web:f417df05b159afb668064c"
};
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app)
const db = getFirestore(app)
/*const storage = getStorage(app)*/
const rtdb = getDatabase(app)


export { auth, db, /*storage*/ rtdb }