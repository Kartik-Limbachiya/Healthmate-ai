// firebaseClient.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSbUQ6UQTMvRQlwUWgw-qFTaUoH6hwtRk",
  authDomain: "healthmate-1-4dc11.firebaseapp.com",
  databaseURL: "https://healthmate-1-4dc11-default-rtdb.firebaseio.com",
  projectId: "healthmate-1-4dc11",
  storageBucket: "healthmate-1-4dc11.firebasestorage.app",
  messagingSenderId: "295132538205",
  appId: "1:295132538205:web:44532707696a02cab9f4b4"
};
// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app)
const db = getFirestore(app)
/*const storage = getStorage(app)*/
const rtdb = getDatabase(app)


export { auth, db, /*storage*/ rtdb }
