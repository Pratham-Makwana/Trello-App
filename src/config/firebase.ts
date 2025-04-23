import {getApp, getApps, initializeApp} from 'firebase/app';
import messaging from '@react-native-firebase/messaging';
import {
  API_KEY,
  AUTH_DOMAIN,
  APP_ID,
  MESSAGING_SENDER_ID,
  PROJECT_ID,
  STORAGE_BUCKET,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME,
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
  updateDoc,
  deleteDoc,
  Timestamp,
  startAt,
  endAt,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {Board, FakeTaskList, TaskItem, TaskList, User} from '@utils/Constant';
import {ref, uploadBytes, getDownloadURL, getStorage} from 'firebase/storage';
import {addBoard} from '@store/board/boardSlice';

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
const storage = getStorage(firebaseApp);

// Export references
export {auth, db};

// Collection Reference
export const userRef = collection(db, 'users');
export const boardRef = collection(db, 'boards');
export const listRef = collection(db, 'lists');
export const cardRef = collection(db, 'cards');
export const userBoardRef = collection(db, 'user_boards');
export const boardInvitationRef = collection(db, 'board_invitations');

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    const {user} = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, {
      displayName: username,
      photoURL: `https://ui-avatars.com/api/?name=${username}&format=png&background=random&color=fff&rounded=true`,
    });

    const token = await messaging().getToken();
    // console.log(user.displayName);
    // Set user data with uid as the document ID
    const userDocRef = doc(userRef, user.uid); // sets doc ID to uid
    await setDoc(userDocRef, {
      uid: user.uid,
      username: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      notificationToken: token,
    });
  } catch (error) {
    console.log('==> firebase:createUser: ', error);
  }
};

export const LoginUser = async (email: string, password: string) => {
  try {
    const {user} = await signInWithEmailAndPassword(auth, email, password);

    const token = await messaging().getToken();
    console.log('==> token', token);

    const userDocRef = doc(userRef, user.uid);
    await updateDoc(userDocRef, {
      notificationToken: token,
    });
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
  dispatch: any,
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
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString(),
      createdBy: auth.currentUser?.uid,
    };
    await setDoc(docRef, boardData);

    const joinId = `${auth.currentUser?.uid}_${docRef.id}`;
    await setDoc(doc(userBoardRef, joinId), {
      userId: auth.currentUser?.uid,
      boardId: docRef.id,
      addedAt: new Date().toISOString(),
    });
    dispatch(addBoard(boardData));

    // console.log('Board and user_board entry created');
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getBoards = async (userId: string) => {
  try {
    const q = query(userBoardRef, where('userId', '==', userId));
    const joinDocs = await getDocs(q);

    // console.log('==> joinDocs', joinDocs);
    const boardIds = joinDocs.docs.map(doc => doc.data().boardId);

    const boardDocs = await Promise.all(
      boardIds.map(boardId => getDoc(doc(boardRef, boardId))),
    );

    const boardList: Board[] = boardDocs
      .filter(doc => doc.exists())
      .map(doc => {
        const data = doc.data();

        const createdAt = data.created_at ?? new Date().toISOString();
        const lastEdit = data.last_edit ?? null;

        return {
          boardId: data.boardId,
          createdBy: data.createdBy,
          title: data.title,
          created_at: createdAt,
          last_edit: lastEdit,
          background: Array.isArray(data.background) ? data.background : [],
          workspace: data.workspace,
          userInfo: data.userInfo,
        } as Board;
      });

    return boardList;
  } catch (error) {
    console.log('==> firebase:getAllBoards:', error);
    return [];
  }
};

export const getBoardInfo = async (boardId: string, userId: string) => {
  try {
    const userBoardQuery = query(
      userBoardRef,
      where('boardId', '==', boardId),
      where('userId', '==', userId),
    );

    const userBoardSnapshot = await getDocs(userBoardQuery);

    if (userBoardSnapshot.empty) {
      console.log('No board found for the given boardId and userId');
      return [];
    }
    const boardQuery = query(boardRef, where('boardId', '==', boardId));
    const boardSnapshot = await getDocs(boardQuery);

    if (boardSnapshot.empty) {
      console.log('Board not found');
      return null;
    }

    const boardData = boardSnapshot.docs[0].data();

    const creatorId = boardData.createdBy;
    const creatorDocRef = doc(userRef, creatorId);
    const creatorSnapshot = await getDoc(creatorDocRef);

    if (!creatorSnapshot.exists()) {
      console.log('Board creator not found');
      return null;
    }

    const creatorData = creatorSnapshot.data();

    const boardInfo = {
      ...boardData,
      userInfo: {
        username: creatorData?.username,
        email: creatorData?.email,
      },
    };
    return boardInfo;
  } catch (error) {
    console.error('Error fetching board data: ', error);
    return [];
  }
};

export const listenToUpdateBoardInfo = (
  boardId: string,
  callback: (board: Board) => void,
) => {
  const docRef = doc(boardRef, boardId);
  return onSnapshot(docRef, snapshot => {
    if (snapshot.exists()) {
      callback({...snapshot.data()} as Board);
    }
  });
};
export const updateBoardInfo = async (board: Board) => {
  try {
    const docRef = doc(boardRef, board.boardId);
    await updateDoc(docRef, {
      title: board?.title,
    });

    const updatedBoard = await getDoc(docRef);

    return updatedBoard.data();
  } catch (error) {
    console.log('Error updateBoard: ', error);
  }
};

export const deleteBoard = async (boardId: string) => {
  try {
    const boardDocRef = doc(boardRef, boardId);
    await deleteDoc(boardDocRef);

    const userBoardDocRef = query(
      userBoardRef,
      where('boardId', '==', boardId),
    );

    const querySnapshot = await getDocs(userBoardDocRef);

    querySnapshot.forEach(async doc => {
      await deleteDoc(doc.ref);
    });
    console.log('Board deleted successfully');
  } catch (error) {
    console.log('Error deleting board:', error);
  }
};

export const getBoardMembers = async (boardId: string) => {
  try {
    const q = query(userBoardRef, where('boardId', '==', boardId));
    const joinDocs = await getDocs(q);

    const userIds = joinDocs.docs.map(doc => doc.data().userId);

    const userDocs = await Promise.all(
      userIds.map(userId => getDoc(doc(userRef, userId))),
    );
    const members = userDocs
      .filter(doc => doc.exists())
      .map(doc => ({...doc.data()}));

    return members;
  } catch (error) {
    console.error('Error fetching board members:', error);
    return [];
  }
};

export const addUserToBoard = async (boardId: string, userId: string) => {
  try {
    await addDoc(userBoardRef, {
      boardId: boardId,
      userId: userId,
    });
  } catch (error) {
    console.error('Error adding User To Board : ', error);
  }
};

//  realtime invite collabration
export const listenToUserBoards = (
  userId: string,
  callback: (boards: Board[]) => void,
) => {
  const q = query(userBoardRef, where('userId', '==', userId));
  return onSnapshot(q, async snapshot => {
    const boardIds = snapshot.docs.map(doc => doc.data().boardId);

    const boardPromises = boardIds.map(id => getDoc(doc(boardRef, id)));
    const boardSnapshots = await Promise.all(boardPromises);

    const boards: Board[] = boardSnapshots
      .filter(doc => doc.exists())
      .map(doc => ({...(doc.data() as Board)}));

    callback(boards);
  });
};
//  =================== Board List ==========================
export const getBoardLists = async (boardId: string) => {
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

    // console.log('==> lists', lists);

    return lists || [];
  } catch (error) {
    console.log('Error fetching board List: ', error);
    return [];
  }
};

export const addBoardList = async (
  boardId: string,
  title: string,
  position = 0,
) => {
  try {
    const listDocRef = doc(listRef);
    const newListDoc = {
      list_id: listDocRef.id,
      board_id: boardId,
      title,
      position,
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString(),
    };

    await setDoc(listDocRef, newListDoc);

    return newListDoc || {};
  } catch (error) {
    console.log('Error adding board List: ', error);
  }
};

export const updateBoardList = async (
  list: TaskItem | FakeTaskList,
  newTitle: string,
) => {
  try {
    const listDoc = doc(listRef, list.list_id);
    await updateDoc(listDoc, {
      title: newTitle,
    });
  } catch (error) {
    console.log('Error updating Board List', error);
  }
};
// A single list document updation
export const listenToListInfo = (
  listId: string,
  callback: (updatedList: any) => void,
) => {
  const docRef = doc(listRef, listId);
  return onSnapshot(docRef, snapshot => {
    if (snapshot.exists()) {
      callback({...snapshot.data()});
    }
  });
};

// multiple card list
export const listenToBoardLists = (
  boardId: string,
  callback: (lists: TaskList[]) => void,
) => {
  try {
    const q = query(
      listRef,
      where('board_id', '==', boardId),
      orderBy('position'),
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const lists: TaskList[] = snapshot.docs.map(doc => ({
        list_id: doc.id,
        ...doc.data(),
      })) as TaskList[];

      callback(lists);
    });

    return unsubscribe;
  } catch (error) {
    console.log('Error in listenToBoardLists:', error);
  }
};

// export const deleteBoardList = async (
//   listId: string,
//   boardId: string,
//   listPosition: number,
// ) => {
//   try {
//     const cardQuery = query(cardRef, where('list_id', '==', listId));
//     const cardSnapshot = await getDocs(cardQuery);

//     const deleteCardPromises = cardSnapshot.docs.map(docSnap =>
//       deleteDoc(doc(cardRef, docSnap.id)),
//     );
//     await Promise.all(deleteCardPromises);

//     const listQuery = query(
//       listRef,
//       where('board_id', '==', boardId),
//       where('position', '>', listPosition),
//     );

//     const listSnapshot = await getDocs(listQuery);
//     const batch = writeBatch(db);

//     listSnapshot.forEach(docSnap => {
//       const listRefToUpdate = doc(listRef, docSnap.id);
//       const listData = docSnap.data();
//       batch.update(listRefToUpdate, {position: listData.position - 1});
//     });

//     await batch.commit();

//     const listDoc = doc(listRef, listId);
//     await deleteDoc(listDoc);
//     console.log('==> deleting Board List & card successfully');
//   } catch (error) {
//     console.log('Error deleting Board List', error);
//   }
// };

export const deleteBoardList = async (
  listId: string,
  boardId: string,
  listPosition: number,
) => {
  try {
    const cardsRef = collection(db, 'lists', listId, 'cards');
    const cardSnapshot = await getDocs(cardsRef);

    const deleteCardPromises = cardSnapshot.docs.map(docSnap =>
      deleteDoc(doc(cardsRef, docSnap.id)),
    );
    await Promise.all(deleteCardPromises);

    const listQuery = query(
      collection(db, 'lists'),
      where('board_id', '==', boardId),
      where('position', '>', listPosition),
    );

    const listSnapshot = await getDocs(listQuery);
    const batch = writeBatch(db);

    listSnapshot.forEach(docSnap => {
      const listRefToUpdate = doc(db, 'lists', docSnap.id);
      const listData = docSnap.data();
      batch.update(listRefToUpdate, {position: listData.position - 1});
    });

    await batch.commit();

    const listDocRef = doc(db, 'lists', listId);
    await deleteDoc(listDocRef);

    console.log('✅ Deleted board list and all its cards successfully');
  } catch (error) {
    console.error('❌ Error deleting board list:', error);
  }
};

export const findUsers = async (search: string) => {
  try {
    const q = query(
      userRef,
      orderBy('email'),
      startAt(search),
      endAt(search + '\uf8ff'),
    );

    const snapshot = await getDocs(q);
    const users = snapshot.docs
      .map(doc => ({id: doc.id, ...doc.data()}))
      .filter((user: any) => {
        const isMatch = user?.email === search || user.email.startsWith(search);

        const isNotCurrentUser = user.email !== auth.currentUser?.email;
        return isMatch && isNotCurrentUser;
      });

    return users || [];
  } catch (error) {
    console.log('Error find Users', error);
  }
};
//  ==================== Board Card List =========================

export const addCardList = async (
  listId: string,
  boardId: string,
  title: string,
  position: number = 0,
  imageUrl: any = null,
  done: boolean = false,
) => {
  try {
    const cardRef = collection(db, 'lists', listId, 'cards');

    const newCard = {
      board_id: boardId,
      list_id: listId,
      title,
      position,
      imageUrl,
      done,
      description: '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(cardRef, newCard);
    return {id: docRef.id, ...newCard};
  } catch (error) {
    console.log('Error adding card:', error);
    return null;
  }
};

export const updateCart = async (task: TaskItem) => {
  try {
    if (!task?.id || !task?.list_id) {
      console.error('Invalid task: missing id or list_id');
      return;
    }

    const cardDocRef = doc(db, 'lists', task.list_id, 'cards', task.id);

    await updateDoc(cardDocRef, {
      title: task?.title,
      description: task?.description,
      done: task?.done,
      position: task?.position,
    });
  } catch (error) {
    console.log('Error Updating card', error);
  }
};

export const deleteCard = async (item: TaskItem) => {
  try {
    const deletedCardPosition = item?.position;
    const deletedCardListId = item?.list_id;

    if (!deletedCardListId || item?.id === undefined) {
      console.error('Missing list_id or card id');
      return;
    }

    const cardsRef = collection(db, 'lists', deletedCardListId, 'cards');

    const q = query(cardsRef, where('position', '>', deletedCardPosition));

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.forEach(docSnap => {
      const cardData = docSnap.data();
      const cardRefToUpdate = doc(
        db,
        'lists',
        deletedCardListId,
        'cards',
        docSnap.id,
      );

      batch.update(cardRefToUpdate, {
        position: cardData.position - 1,
      });
    });

    await batch.commit();

    const cardDoc = doc(db, 'lists', deletedCardListId, 'cards', item.id);
    await deleteDoc(cardDoc);
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};

export const listenToCardsList = (
  listId: string,
  callback: (cards: TaskItem[]) => void,
) => {
  try {
    const cardRef = collection(db, 'lists', listId, 'cards');

    const q = query(cardRef, orderBy('position'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const cards: TaskItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskItem[];
      callback(cards);
    });

    return unsubscribe;
  } catch (error) {
    console.log('Error in listenToCardsList:', error);
  }
};

export const getListsByBoardId = async (boardId: string) => {
  try {
    const q = query(listRef, where('board_id', '==', boardId));

    const snapshot = await getDocs(q);

    const lists = snapshot.docs.map(doc => ({
      ...doc.data(),
    }));

    return lists;
  } catch (error) {
    console.error('Error fetching lists for board:', error);
    return [];
  }
};
// ================== Borad Invite ========================

export const sendBoardInvite = async (
  boardId: string,
  userId: string,
  invitedBy: string,
) => {
  const inviteId = `${boardId}_${userId}`;
  await setDoc(doc(boardInvitationRef, inviteId), {
    boardId,
    invitedTo: userId,
    invitedBy,
    status: 'pending',
  });
};

// const onAddUser = async (user: User) => {
//   try {
//     await sendBoardInvite(boardId, user?.uid, auth.currentUser?.uid);
//     goBack(); // maybe show "Invite sent" instead of navigating back
//   } catch (error) {
//     console.log('Error sending invite', error);
//   }
// };

// export const getPendingInvites = async (userId: string) => {
//   const invitesQuery = query(
//     collection(db, 'board_invitations'),
//     where('invitedTo', '==', userId),
//     where('status', '==', 'pending'),
//   );

//   const invitesSnapshot = await getDocs(invitesQuery);
//   return invitesSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
// };

export const listenToPendingInvites = (
  userId: string,
  onUpdate: (invites: any[]) => void,
) => {
  const invitesQuery = query(
    collection(db, 'board_invitations'),
    where('invitedTo', '==', userId),
    where('status', '==', 'pending'),
  );

  const unsubscribe = onSnapshot(invitesQuery, async snapshot => {
    const invitePromises = snapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      const inviteId = docSnap.id;

      const [boardSnap, userSnap] = await Promise.all([
        getDoc(doc(db, 'boards', data.boardId)),
        getDoc(doc(db, 'users', data.invitedBy)),
      ]);

      const boardData = boardSnap.exists() ? boardSnap.data() : null;
      const invitedByData = userSnap.exists() ? userSnap.data() : null;

      return {
        id: inviteId,
        ...data,
        boardName: boardData?.title || 'Unknown Board',
        invitedByUserInfo: invitedByData || 'Unknown User',
      };
    });

    const enrichedInvites = await Promise.all(invitePromises);
    onUpdate(enrichedInvites);
  });

  return unsubscribe;
};

export const acceptInvite = async (
  inviteId: string,
  boardId: string,
  userId: string,
) => {
  await updateDoc(doc(db, 'board_invitations', inviteId), {
    status: 'accepted',
  });

  await addUserToBoard(boardId, userId);

  await deleteDoc(doc(db, 'board_invitations', inviteId));
};

export const declineInvite = async (inviteId: string) => {
  await updateDoc(doc(db, 'board_invitations', inviteId), {
    status: 'declined',
  });

  await deleteDoc(doc(db, 'board_invitations', inviteId));
};

export const uploadToCloudinary = async (image: {
  uri: string;
  type?: string;
  fileName?: string;
}): Promise<string> => {
  const data = new FormData();
  data.append('file', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'upload.jpg',
  });

  data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: data,
    },
  );

  const result = await res.json();

  if (result.secure_url) {
    return result.secure_url;
  } else {
    throw new Error('Upload failed: ' + JSON.stringify(result));
  }
};
