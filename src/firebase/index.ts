
import { app, auth, database } from './client';
import { getFirestore } from 'firebase/firestore';

export { app as firebaseApp, auth, database };

export const initializeFirebase = () => {
  return {
    firebaseApp: app,
    auth: auth,
    database: database,
    firestore: getFirestore(app)
  };
};
