import { getFirestore } from "firebase/firestore";
import { getFirestore as getFirestoreLite } from "firebase/firestore/lite";
import { app } from "./config";

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const dbLite = getFirestoreLite(app);
