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
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  setDoc,
  orderBy,
} from 'firebase/firestore';
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
export const listRef = collection(db, 'lists');

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    const {user} = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, {
      displayName: username,
      // photoURL: `https://ui-avatars.com/api/?name=${username}`,
      photoURL: `https://ui-avatars.com/api/?name=${username}&format=png&background=random&color=fff&rounded=true`,
    });

    // console.log(user.displayName);
    // Set user data with uid as the document ID
    const userDocRef = doc(userRef, user.uid); // sets doc ID to uid
    await setDoc(userDocRef, {
      uid: user.uid,
      username: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });

    // await addDoc(userRef, {
    //   uid: user.uid,
    //   username: user.displayName,
    //   email: user.email,
    //   displayName: user.displayName,
    //   photoURL: user.photoURL,
    // });
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

export const SignOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.log('==> firebase:logout: ', error);
  }
};

export const createBoard = async (
  boardName: string,
  selectedColor: string[],
  workspace: string,
) => {
  try {
    const docRef = doc(boardRef);

    const boardData = {
      boardId: docRef.id,
      title: boardName,
      background: selectedColor,
      workspace: workspace,
      created_at: new Date(),
      last_edit: new Date(),
      createdBy: auth.currentUser?.uid,
    };
    await setDoc(docRef, boardData);
    // const docRef = await addDoc(boardRef, {
    //   title: boardName,
    //   background: selectedColor,
    //   workspace: workspace,
    //   created_at: new Date(),
    //   last_edit: new Date(),
    //   createdBy: auth.currentUser?.uid,
    // });
    // console.log('Document written with ID: ', docRef);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

// ============== Get All Board ==============================
// export const getAllBoards = async () => {
//   try {
//     const boards = await getDocs(boardRef);
//     const boardList = boards.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     return boardList;
//   } catch (error) {
//     console.log('==> firebase:getAllBoards: ', error);
//   }
// };

// ========= Get All Board Which Created By The Current LogIn User ===============
export const getAllBoards = async (userId: string) => {
  try {
    const q = query(boardRef, where('createdBy', '==', userId));
    const boards = await getDocs(q);
    const boardList = boards.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('==> boardList', boardList);

    return boardList;
  } catch (error) {
    console.log('==> firebase:getAllBoards: ', error);
  }
};

export const getBoardInfo = async (boardId: string, userId: string) => {
  console.log('==> firebase:getBoardInfo: ', boardId, userId);
  try {
    const boardQuery = query(
      boardRef,
      where('createdBy', '==', userId),
      where('boardId', '==', boardId),
    );

    const boardSnapshot = await getDocs(boardQuery);

    // Check if board exists for the given boardId and userId
    if (boardSnapshot.empty) {
      console.log('No board found for the given boardId and userId');
      return [];
    }
    const boardData = boardSnapshot.docs[0].data();
    console.log('==> boardData', boardData);

    // Fetch user data from the users collection
    const userDocRef = doc(userRef, userId);
    const userSnapshot = await getDoc(userDocRef);
    const userData = userSnapshot.data();

    // Check if user exists
    if (!userSnapshot.exists()) {
      console.log('User not found');
      return [];
    }
    const boardInfo = {
      ...boardData,
      userInfo: {
        username: userData?.username,
        email: userData?.email,
      },
    };
    console.log('==> boardInfo', boardInfo);

    return boardInfo;
  } catch (error) {
    console.error('Error fetching board data: ', error);
    return [];
  }
};

export const getBoardLists = async (boardId: string) => {
  console.log('==>getBoardLists ', boardId);

  try {
    const q = query(
      listRef,
      where('board_id', '==', boardId),
      orderBy('position'),
    );

    const querySnapshot = await getDocs(q);

    const lists = querySnapshot.docs.map(doc => ({
      // id: doc.id,
      ...doc.data(),
    }));

    console.log('==> lists', lists);

    return lists || [];
  } catch (error) {
    console.error('Error fetching board List: ', error);
    return [];
  }
};

export const addBoardList = async (
  boardId: string,
  title: string,
  position = 0,
) => {
  console.log('==>', boardId, title, position);

  try {
    const listDocRef = doc(listRef);
    // const listDocRef = await addDoc(listRef, {
    //   board_id: boardId,
    //   title,
    //   position,
    //   created_at: new Date(),
    // });

    const newListDoc = {
      list_id: listDocRef.id,
      board_id: boardId,
      title,
      position,
      created_at: new Date(),
      last_edit: new Date(),
    };

    await setDoc(listDocRef, newListDoc);
    console.log('==> newListDoc ', newListDoc);

    return newListDoc || {};
  } catch (error) {
    console.error('Error adding board List: ', error);
  }
};
