
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./config";

// Initialize Firebase
// This pattern prevents re-initializing the app on hot-reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const database = getDatabase(app);
const auth = getAuth(app);

// DO NOT perform auth actions here. This file can be imported by the server during build.
// Auth logic should be handled exclusively on the client-side, for example, in hooks or components.

export { app, database, auth };
