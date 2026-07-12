import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEtL9vAfE12wjRjNxoVSSETL197K4iaWI",
  authDomain: "assetflow-1fcad.firebaseapp.com",
  projectId: "assetflow-1fcad",
  storageBucket: "assetflow-1fcad.firebasestorage.app",
  messagingSenderId: "1024184323062",
  appId: "1:1024184323062:web:97aa6891f4a7ba623395d7",
  measurementId: "G-RBMFYH9YS8"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);