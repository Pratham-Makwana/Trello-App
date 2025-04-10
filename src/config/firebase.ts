import {getApp, getApps, initializeApp} from 'firebase/app';
import {
  API_KEY,
  AUTH_DOMAIN,
  APP_ID,
  MESSAGING_SENDER_ID,
  PROJECT_ID,
  STORAGE_BUCKET,
} from '@env';
import {
  createUserWithEmailAndPassword,
  initializeAuth,
  updateProfile,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import {getFirestore, collection, addDoc, getDocs} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

let app;
let auth: any;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    console.log('Error initializing app: ' + error);
  }
} else {
  app = getApp();
  auth = getAuth(app);
}
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore Database
const db = getFirestore(firebaseApp);

// Export references
export {auth, db};

// Collection Reference
export const userRef = collection(db, 'users');
export const boardRef = collection(db, 'boards');

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    const {user} = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, {
      displayName: username,
      photoURL: `https://ui-avatars.com/api/?name=${username}`,
    });

    // console.log(user.displayName);
    await addDoc(userRef, {
      uid: user.uid,
      username: user.displayName,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
    console.log('User Created Successfully', user);
  } catch (error) {
    console.log('==> firebase:createUser: ', error);
  }
};

export const LoginUser = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log('==> firebase:LoginUser: ', error);
  }
};

export const createBoard = async (
  boardName: string,
  selectedColor: string[],
  workspace: string,
) => {
  try {
    const docRef = await addDoc(boardRef, {
      title: boardName,
      background: selectedColor,
      workspace: workspace,
      created_at: new Date(),
      last_edit : new Date(),
      createdBy: auth.currentUser?.uid,
    });
    console.log('Document written with ID: ', docRef);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getAllBoards = async () => {
  try {
    const boards = await getDocs(boardRef);
    const boardList = boards.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('All Boards: ', boardList);
    return boardList;
  } catch (error) {
    console.log('==> firebase:getAllBoards: ', error);
  }
};
