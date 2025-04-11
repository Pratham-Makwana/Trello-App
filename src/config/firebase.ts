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

// Function to fetch board data by user ID and workspace filter
// export const getBoardInfo = async (boardId: string, userId: string) => {
//   console.log('==> firebase:getBoardInfo: ', boardId, userId);

//   const boardDocRef = await doc(db, 'boards', boardId);
//   // const boardData = await getDoc(doc(boardRef, boardId));
//   // console.log("boardData", boardData.id);
//   // try {
//   //   const boardDocSnap = await getDoc(boardDocRef);

//   //   if (boardDocSnap.exists()) {
//   //     const boardData = boardDocSnap.data();
//   //     console.log('==>boardData', boardData);

//   //     // Optional: check if this board belongs to the user
//   //     if (boardData.createdBy == userId) {
//   //       return boardData;
//   //     } else {
//   //       console.log('Board does not belong to this user.');
//   //       return [];
//   //     }
//   //   } else {
//   //     console.log('No such document!');
//   //     return [];
//   //   }
//   // } catch (error) {
//   //   console.error('Error getting document:', error);
//   //   return [];
//   // }

//   // Reference to the 'boards' collection
//   // const boardRef1 = collection(db, 'boards', boardId);
//   // console.log('==> boardRef1: ', boardRef1);

//   // Create the query with conditions
//   const q = query(
//     boardDocRef,
//     where('createdBy', '==', userId),
//     // where('id', '==', boardId),
//     where('workspace', 'in', ['Public', 'Workspace']),
//   );

//   // Fetch the data from Firestore
//   try {
//     // const querySnapshot = await getDocs(q);
//     // console.log('==> firebase:getBoardInfo: ', querySnapshot.docs);
//     // // // If we find any matching board(s), process them
//     // if (!querySnapshot.empty) {
//     //   querySnapshot.forEach(doc => {
//     //   console.log("==> doc", doc);
//     //     console.log(doc.id, ' => ', doc.data());
//     //   });
//     // } else {
//     //   console.log('No matching boards found.');
//     // }
//   } catch (error) {
//     console.error('Error fetching board data: ', error);
//   }
// };

// Example usage: Fetch board for user with ID 'vRgqBAJ2nXdL8b8fiPmlqVOg6al2' and board ID '3nIgiXsRohfCyLx4BSnX'
// getBoardInfo('vRgqBAJ2nXdL8b8fiPmlqVOg6al2', '3nIgiXsRohfCyLx4BSnX');

// export const getBoardInfo = async (boardId: string) => {
//   console.log('==> firebase:getBoardInfo: ', boardId);

//   // try {
//   //   const board = await getDoc(doc(boardRef, boardId));
//   //   if (!board.exists()) {
//   //     console.log('No such document!');
//   //     return [];
//   //   }
//   //   const boardData = board.data();
//   //   console.log('Board Info: ', board.data());
//   // } catch (error) {
//   //   console.log('==> firebase:getAllBoards: ', error);
//   // }
//   try {
//     // Create a query that checks the boardId, userId, and workspace
//     const q = query(
//       boardRef,
//       where('id', '==', boardId),
//       // where('createdBy', '==', auth.currentUser?.uid),
//       // where('workspace', 'in', ['Public', 'Workspace']),
//     );

//     // Execute the query
//     const querySnapshot = await getDocs(q);
//     console.log('==> firebase:getBoardInfo: ', querySnapshot.docs);

//     if (querySnapshot.empty) {
//       console.log('No matching board found!');
//       return null;
//     }

//     // Assuming there's only one result since boardId is unique
//     const boardData = querySnapshot.docs[0].data();

//     // Optionally, fetch the user information if needed
//     const userRef = doc(db, 'users', userId);
//     const userSnap = await getDoc(userRef);

//     let userData = null;
//     if (userSnap.exists()) {
//       userData = userSnap.data();
//     }

//     // Combine board data with user first name (if needed)
//     return {...boardData, user: {first_name: userData?.first_name}};
//   } catch (error) {
//     console.error('Error getting board info:', error);
//     return null;
//   }
// };
