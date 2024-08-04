// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZzKmRsphOdTQTRJNxf9jJ47golHr6xsw",
  authDomain: "hspantry-f443d.firebaseapp.com",
  projectId: "hspantry-f443d",
  storageBucket: "hspantry-f443d.appspot.com",
  messagingSenderId: "682698282593",
  appId: "1:682698282593:web:ca038954c76d990f49fc20",
  measurementId: "G-YEKQFPPB6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
const firestore = getFirestore(app);

export {firestore}