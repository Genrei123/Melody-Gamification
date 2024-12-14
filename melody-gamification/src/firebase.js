import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnWVPB0LfJ7LYq7JjiQowZhTwv722bpJ8",
  authDomain: "melody-62401.firebaseapp.com",
  projectId: "melody-62401",
  storageBucket: "melody-62401.firebasestorage.app",
  messagingSenderId: "812900901350",
  appId: "1:812900901350:web:6abfcdc568c1788dbbb627"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };