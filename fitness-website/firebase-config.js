// firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB79d36fqlibSzotvtKgLxa3xP5_uEaVg",
  authDomain: "healthmate-ai-683ba.firebaseapp.com",
  databaseURL: "https://healthmate-ai-683ba-default-rtdb.firebaseio.com",
  projectId: "healthmate-ai-683ba",
  storageBucket: "healthmate-ai-683ba.firebasestorage.app",
  messagingSenderId: "26037118687",
  appId: "1:26037118687:web:da83ee1de48358e3152b6a"
};
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app)
const db = getFirestore(app)
/*const storage = getStorage(app)*/
const rtdb = getDatabase(app)


export { auth, db, /*storage*/ rtdb }
