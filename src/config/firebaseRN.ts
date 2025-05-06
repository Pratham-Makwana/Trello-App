import {CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET} from '@env';
import auth from '@react-native-firebase/auth';
import firestore, {
  deleteDoc,
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {Board, FakeTaskList, TaskItem, TaskList, User} from '@utils/Constant';

export const db = firestore();
export const userRef = db.collection('users');
export const boardRef = db.collection('boards');
export const listRef = db.collection('lists');
export const cardRef = db.collection('cards');
export const userBoardRef = db.collection('user_boards');
export const boardInvitationRef = db.collection('board_invitations');

export const createUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const {user} = await auth().createUserWithEmailAndPassword(email, password);

  await user.updateProfile({
    displayName: username,
    photoURL: `https://ui-avatars.com/api/?name=${username}&format=png&background=0D8ABC&color=fff&rounded=true`,
  });

  await user.reload();
  const updatedUser = auth().currentUser;

  const token = await messaging().getToken();

  await userRef.doc(user.uid).set({
    uid: updatedUser?.uid,
    username: username,
    email: updatedUser?.email,
    photoURL: updatedUser?.photoURL,
    notificationToken: token,
    createdAt: new Date().toISOString(),
  });
};

export const loginUser = async (email: string, password: string) => {
  const userCredential = await auth().signInWithEmailAndPassword(
    email,
    password,
  );
  const user = userCredential.user;

  const token = await messaging().getToken();

  await userRef.doc(user.uid).update({
    notificationToken: token,
  });
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.log('==> firebase:logout: ', error);
  }
};

export const checkUserExists = async (email: string) => {
  try {
    const userSnapshot = await userRef.where('email', '==', email).get();

    if (userSnapshot.docs.length === 0) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking user existence:', error);
  }
};

// ================ Board ==================

export const createBoard = async (
  dispatch: any,
  boardName: string,
  selectedColor: string[],
  workspace: string,
) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    const docRef = boardRef.doc();

    const boardData = {
      boardId: docRef.id,
      title: boardName,
      background: selectedColor,
      workspace: workspace,
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString(),
      createdBy: user.uid,
    };

    await docRef.set(boardData);

    await addUserToBoard(docRef.id, user.uid, 'creator', 'edit');

    // dispatch(addBoard(boardData));
  } catch (error) {
    console.error('Error creating board: ', error);
  }
};

export const getBoardInfo = async (boardId: string, userId: string) => {
  try {
    const userBoardQuery = userBoardRef
      .where('boardId', '==', boardId)
      .where('userId', '==', userId);

    const userBoardSnapshot = await userBoardQuery.get();

    if (userBoardSnapshot.empty) {
      console.log('No board found for the given boardId and userId');
      return null;
    }

    const userBoardData = userBoardSnapshot.docs[0].data();
    const role = userBoardData?.role;
    const mode = userBoardData?.mode;
    const boardDoc = await boardRef.doc(boardId).get();

    if (!boardDoc.exists) {
      console.log('Board not found');
      return null;
    }

    const boardData = boardDoc.data();
    if (!boardData) return null;

    const creatorDoc = await userRef.doc(boardData.createdBy).get();

    if (!creatorDoc.exists) {
      console.log('Board creator not found');
      return null;
    }

    const creatorData = creatorDoc.data();

    const boardInfo = {
      ...boardData,
      role,
      mode,
      userInfo: {
        username: creatorData?.username || 'Unknown',
        email: creatorData?.email || '',
        userId: creatorData?.uid,
      },
    };

    return boardInfo;
  } catch (error) {
    console.error('Error fetching board data: ', error);
    return null;
  }
};

export const listenToUpdateBoardInfo = (
  boardId: string,
  userId: string,
  callback: (board: Board ) => void,
) => {
  const docRef = boardRef.doc(boardId);
  // const joinId = `${userId}_${boardId}`;
  // const userBoard = userBoardRef.doc(joinId);

  const unsubscribe = docRef.onSnapshot(async snapshot => {
    if (snapshot.exists) {
      const boardData = snapshot.data() as Board;

      const creatorDoc = await userRef.doc(boardData.createdBy).get();

      if (!creatorDoc.exists) {
        console.log('Board creator not found');
        return null;
      }

      const creatorData = creatorDoc.data();

      // const userBoardDoc = await userBoard.get();
      // const role = userBoardDoc.exists ? userBoardDoc.data()?.role : 'creator';

      const updatedBoard = {
        ...boardData,
        userInfo: {
          username: creatorData?.username || 'Unknown',
          email: creatorData?.email || '',
          userId: creatorData?.uid,
        },
        // role: role,
      };

      callback(updatedBoard);
    }
  });

  return unsubscribe;
};

export const updateBoardInfo = async (board: Board) => {
  try {
    const docRef = boardRef.doc(board.boardId);

    await docRef.update({
      background: board.background,
      workspace: board.workspace,
      title: board.title,
      last_edit: new Date().toISOString(),
    });

    const updatedDoc = await docRef.get();
    return updatedDoc.data();
  } catch (error) {
    console.log('Error updating board:', error);
    return null;
  }
};

export const deleteBoard = async (boardId: string) => {
  try {
    await boardRef.doc(boardId).delete();

    const userBoardQuery = userBoardRef.where('boardId', '==', boardId);
    const querySnapshot = await userBoardQuery.get();

    const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
  } catch (error) {
    console.log('Error deleting board:', error);
  }
};

export const listenToBoardMembers = (
  boardId: string,
  callback: (members: User[]) => void,
) => {
  const queryRef = userBoardRef.where('boardId', '==', boardId);

  let userUnsubscribes: (() => void)[] = [];

  const unsubscribe = queryRef.onSnapshot(snapshot => {
    userUnsubscribes.forEach(unsub => unsub());
    userUnsubscribes = [];

    if (snapshot.empty) {
      callback([]);
      return;
    }

    const members: User[] = [];

    snapshot.docs.forEach(doc => {
      const {userId, role, mode} = doc.data();
      const userDocRef = userRef.doc(userId);

      const unsub = userDocRef.onSnapshot(userSnapshot => {
        if (userSnapshot.exists) {
          const userData = userSnapshot.data() as User;

          const index = members.findIndex(m => m.uid === userId);
          if (index !== -1) {
            members[index] = {...userData, role, mode};
          } else {
            members.push({...userData, role, mode});
          }

          callback([...members]);
        }
      });

      userUnsubscribes.push(unsub);
    });
  });

  return () => {
    unsubscribe();
    userUnsubscribes.forEach(unsub => unsub());
  };
};

export const addUserToBoard = async (
  boardId: string,
  userId: string,
  role: string,
  mode: string,
) => {
  try {
    const joinId = `${userId}_${boardId}`;
    const joinDocRef = userBoardRef.doc(joinId);

    const joinDoc = await joinDocRef.get();

    if (joinDoc.exists) {
      console.log('User is already a member of the board');
      return;
    }

    await joinDocRef.set({
      boardId,
      userId,
      role,
      mode,
      addedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error adding user to board:', error);
  }
};

// export const listenToUserBoards = (
//   userId: string,
//   callback: (boards: Board[]) => void,
// ) => {
//   const queryRef = userBoardRef.where('userId', '==', userId);

//   let boardUnsubscribes: (() => void)[] = [];

//   const unsubscribe = queryRef.onSnapshot(snapshot => {
//     if (snapshot.empty) {
//       boardUnsubscribes.forEach(unsub => unsub());
//       boardUnsubscribes = [];
//       callback([]);
//       return;
//     }

//     boardUnsubscribes.forEach(unsub => unsub());
//     boardUnsubscribes = [];

//     console.log("==> ", snapshot.docs.map(doc => doc.data()));
    

//     const boardIds = snapshot.docs.map(doc => doc.data().boardId);

//     const boards: Board[] = [];

//     boardIds.forEach(boardId => {
//       const boardDocRef = boardRef.doc(boardId);

//       const unsub = boardDocRef.onSnapshot(boardSnapshot => {
//         if (boardSnapshot.exists) {
//           const boardData = boardSnapshot.data() as Board;

//           const index = boards.findIndex(b => b.boardId === boardId);
//           if (index !== -1) {
//             boards[index] = {...boardData};
//           } else {
//             boards.push({...boardData});
//           }
//           callback([...boards]);
//         }
//       });

//       boardUnsubscribes.push(unsub);
//     });
//   });

//   return () => {
//     unsubscribe();
//     boardUnsubscribes.forEach(unsub => unsub());
//   };
// };

export const listenToUserBoards = (
  userId: string,
  filterType: 'owner' | 'member' | undefined,
  callback: (boards: Board[]) => void,
) => {
  const queryRef = userBoardRef.where('userId', '==', userId);

  let boardUnsubscribes: (() => void)[] = [];

  const unsubscribe = queryRef.onSnapshot(snapshot => {
    if (snapshot.empty) {
      boardUnsubscribes.forEach(unsub => unsub());
      boardUnsubscribes = [];
      callback([]);
      return;
    }

    boardUnsubscribes.forEach(unsub => unsub());
    boardUnsubscribes = [];

    const filteredBoardIds: string[] = [];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const role = data.role;

      if (
        filterType === 'owner' && role === 'creator' ||
        filterType === 'member' && role !== 'creator' ||
        filterType === undefined
      ) {
        filteredBoardIds.push(data.boardId);
      }
    });

    const boards: Board[] = [];

    filteredBoardIds.forEach(boardId => {
      const boardDocRef = boardRef.doc(boardId);

      const unsub = boardDocRef.onSnapshot(boardSnapshot => {
        if (boardSnapshot.exists) {
          const boardData = boardSnapshot.data() as Board;

          const index = boards.findIndex(b => b.boardId === boardId);
          if (index !== -1) {
            boards[index] = {...boardData};
          } else {
            boards.push({...boardData});
          }
          callback([...boards]);
        }
      });

      boardUnsubscribes.push(unsub);
    });
  });

  return () => {
    unsubscribe();
    boardUnsubscribes.forEach(unsub => unsub());
  };
};


//  =================== Board List ==========================

export const addBoardList = async (
  boardId: string,
  title: string,
  position = 0,
) => {
  try {
    const listDocRef = listRef.doc();
    const newListDoc = {
      list_id: listDocRef.id,
      board_id: boardId,
      title,
      position,
      created_at: new Date().toISOString(),
      last_edit: new Date().toISOString(),
    };

    await listDocRef.set(newListDoc);

    return newListDoc;
  } catch (error) {
    console.log('Error adding board List: ', error);
    return null;
  }
};

export const getBoardLists = async (boardId: string) => {
  try {
    const querySnapshot = await listRef
      .where('board_id', '==', boardId)
      .orderBy('position')
      .get();

    const lists = querySnapshot.docs.map(doc => ({
      ...doc.data(),
    }));

    return lists || [];
  } catch (error) {
    console.log('Error fetching board List: ', error);
    return [];
  }
};

export const updateBoardList = async (
  list: TaskItem | FakeTaskList,
  newTitle: string,
  newPosition?: number,
) => {
  try {
    const updates: {title: string; last_edit: string; position?: number} = {
      title: newTitle,
      last_edit: new Date().toISOString(),
    };
    const listDocRef = listRef.doc(list.list_id);

    if (newPosition !== undefined) {
      updates['position'] = newPosition;
    }

    await listDocRef.update(updates);
  } catch (error) {
    console.log('Error updating Board List:', error);
  }
};

export const listenToListInfo = (
  listId: string,
  callback: (updatedList: any) => void,
) => {
  const docRef = listRef.doc(listId);

  return docRef.onSnapshot(snapshot => {
    if (snapshot.exists) {
      callback({...snapshot.data()});
    }
  });
};

export const listenToBoardLists = (
  boardId: string,
  callback: (lists: TaskList[]) => void,
) => {
  try {
    const listQuery = firestore()
      .collection('lists')
      .where('board_id', '==', boardId)
      .orderBy('position');

    const unsubscribe = listQuery.onSnapshot(snapshot => {
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

export const deleteBoardList = async (
  listId: string,
  boardId: string,
  listPosition: number,
) => {
  try {
    const cardsRef = listRef.doc(listId).collection('cards');
    const cardSnapshot = await cardsRef.get();

    const deleteCardPromises = cardSnapshot.docs.map(docSnap =>
      cardsRef.doc(docSnap.id).delete(),
    );
    await Promise.all(deleteCardPromises);

    const listQuery = listRef
      .where('board_id', '==', boardId)
      .where('position', '>', listPosition);

    const listSnapshot = await listQuery.get();
    const batch = db.batch();

    listSnapshot.forEach(docSnap => {
      const listRefToUpdate = listRef.doc(docSnap.id);
      const listData = docSnap.data();
      batch.update(listRefToUpdate, {position: listData.position - 1});
    });

    await batch.commit();

    await listRef.doc(listId).delete();
  } catch (error) {
    console.log(' Error deleting board list:', error);
  }
};

export const findUsers = async (search: string) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) console.log('No current user');

    const q = userRef
      .orderBy('email')
      .startAt(search)
      .endAt(search + '\uf8ff');

    const snapshot = await q.get();

    const users = snapshot.docs
      .map(doc => ({id: doc.id, ...doc.data()}))
      .filter((user: any) => {
        const isMatch =
          user?.email === search || user.email?.startsWith(search);
        const isNotCurrentUser = user.email !== currentUser?.email;
        return isMatch && isNotCurrentUser;
      });

    return users || [];
  } catch (error) {
    console.log('Error finding users:', error);
    return [];
  }
};

export const addCardList = async (
  listId: string,
  boardId: string,
  title: string,
  position: number = 0,
  imageUrl: any = null,
  done: boolean = false,
) => {
  try {
    const cardCollectionRef = listRef.doc(listId).collection('cards');

    const newCard = {
      board_id: boardId,
      list_id: listId,
      title,
      position,
      imageUrl,
      done,
      description: '',
      startDate: '',
      endDate: '',
      labels: {
        title: '',
        color: '',
      },
      assigned_to: [],
      createdAt: new Date().toISOString(),
    };

    const docRef = await cardCollectionRef.add(newCard);

    return {id: docRef.id, ...newCard};
  } catch (error) {
    console.log('Error adding card:', error);
    return null;
  }
};

export const updateCart = async (task: TaskItem) => {
  try {
    if (!task?.id || !task?.list_id) {
      console.log('Invalid task: missing id or list_id');
      return;
    }

    const cardDocRef = listRef
      .doc(task.list_id)
      .collection('cards')
      .doc(task.id);

    await cardDocRef.update({
      title: task.title,
      description: task.description,
      done: task.done,
      position: task.position,
      startDate: task.startDate,
      endDate: task.endDate,
      label: {
        title: task.label?.title || '',
        color: task.label?.color || '',
      },
      assigned_to: task?.assigned_to,
    });
  } catch (error) {
    console.log('Error updating card:', error);
  }
};

export const deleteCard = async (item: TaskItem) => {
  try {
    const deletedCardPosition = item?.position;
    const deletedCardListId = item?.list_id;

    if (!deletedCardListId || item?.id === undefined) {
      console.log('Missing list_id or card id');
      return;
    }

    const cardsRef = listRef.doc(deletedCardListId).collection('cards');

    const snapshot = await cardsRef
      .where('position', '>', deletedCardPosition)
      .get();

    const batch = db.batch();

    snapshot.forEach(docSnap => {
      const cardRefToUpdate = docSnap.ref;
      const cardData = docSnap.data();

      batch.update(cardRefToUpdate, {
        position: cardData.position - 1,
      });
    });

    await batch.commit();

    const cardDocRef = cardsRef.doc(item.id);
    await cardDocRef.delete();
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};


type FilterOptions = {
  assignedUserId?: string | null;
  status?: 'completed' | 'incomplete' | null;
  dueDate?: 'over due' | 'today' | 'tomorrow' | 'week' | 'month' | null;
};

export const listenToCardsList = (
  listId: string,
  callback: (cards: TaskItem[]) => void,
  filters?: FilterOptions,
) => {
  try {
    const cardRef = firestore()
      .collection('lists')
      .doc(listId)
      .collection('cards');
    let q: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
      cardRef;

    if (filters?.status === 'completed') {
      q = q.where('done', '==', true);
    } else if (filters?.status === 'incomplete') {
      q = q.where('done', '==', false);
    }

    q = q.where('list_id', '==', listId);
    q = q.orderBy('position');

    const unsubscribe = q.onSnapshot(async snapshot => {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      const cards: (TaskItem & {listTitle: string})[] = [];

      for (const doc of snapshot.docs) {
        const cardData = doc.data() as TaskItem;

        if (filters?.assignedUserId) {
          const assignedIds = (cardData.assigned_to || []).map(
            user => user?.uid,
          );
          if (!assignedIds.includes(filters.assignedUserId)) {
            continue;
          }
        }

        if (filters?.dueDate) {
          const end = cardData.endDate
            ? new Date(
                cardData.endDate.seconds * 1000 +
                  cardData.endDate.nanoseconds / 1000000,
              )
            : null;

          if (!end) continue;

          const dueStart = new Date(end);
          dueStart.setHours(0, 0, 0, 0);

          const shouldInclude = (() => {
            switch (filters.dueDate) {
              case 'over due':
                return end < new Date();
              case 'today':
                return end >= todayStart && end <= todayEnd;
              case 'tomorrow': {
                const tStart = new Date();
                tStart.setDate(tStart.getDate() + 1);
                tStart.setHours(0, 0, 0, 0);
                const tEnd = new Date(tStart);
                tEnd.setHours(23, 59, 59, 999);
                return end >= tStart && end <= tEnd;
              }
              case 'week': {
                const weekEnd = new Date();
                weekEnd.setDate(now.getDate() + 7);
                weekEnd.setHours(23, 59, 59, 999);
                return dueStart >= now && dueStart <= weekEnd;
              }
              case 'month': {
                const monthEnd = new Date();
                monthEnd.setMonth(monthEnd.getMonth() + 1);
                monthEnd.setHours(23, 59, 59, 999);
                return dueStart >= now && dueStart <= monthEnd;
              }
              default:
                return true;
            }
          })();

          if (!shouldInclude) continue;
        }

        const listDoc = await firestore().collection('lists').doc(listId).get();
        const listTitle = listDoc.exists ? listDoc.data()?.title || '' : '';

        cards.push({...cardData, id: doc.id, listTitle});
      }

      callback(cards);
    });

    return unsubscribe;
  } catch (error) {
    console.log('Error in listenToCardsList:', error);
  }
};

export const getListsByBoardId = async (boardId: string) => {
  try {
    const q = listRef.where('board_id', '==', boardId).orderBy('position');

    const snapshot = await q.get();

    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return lists;
  } catch (error) {
    console.log('Error fetching lists for board:', error);
    return [];
  }
};

export const sendBoardInvite = async (
  boardId: string,
  userId: string,
  invitedBy: string,
  visibility: string | undefined,
) => {
  const inviteId = `${boardId}_${userId}`;
  try {
    await boardInvitationRef.doc(inviteId).set({
      boardId,
      invitedTo: userId,
      invitedBy,
      status: 'pending',
      visibility,
    });
  } catch (error) {
    console.log(' Error sending board invite:', error);
  }
};

export const listenToPendingInvites = (
  userId: string,
  onUpdate: (invites: any[]) => void,
) => {
  const invitesQuery = boardInvitationRef
    .where('invitedTo', '==', userId)
    .where('status', '==', 'pending');

  const unsubscribe = invitesQuery.onSnapshot(async snapshot => {
    const invitePromises = snapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      const inviteId = docSnap.id;

      const [boardSnap, userSnap] = await Promise.all([
        boardRef.doc(data.boardId).get(),
        userRef.doc(data.invitedBy).get(),
      ]);

      const boardData = boardSnap.exists ? boardSnap.data() : null;
      const invitedByData = userSnap.exists ? userSnap.data() : null;

      return {
        id: inviteId,
        ...data,
        boardName: boardData?.title || 'Unknown Board',
        invitedByUserInfo: {
          email: invitedByData?.email,
          username: invitedByData?.username,
          photoURL: invitedByData?.photoURL,
        },
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
  visibility: string,
) => {
  try {
    await boardInvitationRef.doc(inviteId).update({
      status: 'accepted',
    });
    if (visibility == 'Workspace') {
      await addUserToBoard(boardId, userId, 'member', 'edit');
    } else {
      await addUserToBoard(boardId, userId, 'member', 'view');
    }

    await db.collection('board_invitations').doc(inviteId).delete();
  } catch (error) {
    console.log('Error accepting invite:', error);
  }
};

export const declineInvite = async (inviteId: string) => {
  try {
    await boardInvitationRef.doc(inviteId).update({
      status: 'declined',
    });

    await db.collection('board_invitations').doc(inviteId).delete();
  } catch (error) {
    console.log('Error declining invite:', error);
  }
};

export const leaveBoard = async (boardId: string, userId: string) => {
  try {
    const joinDocRef = userBoardRef.doc(`${userId}_${boardId}`);
    await deleteDoc(joinDocRef);
  } catch (error) {
    console.log('Error leaving board:', error);
  }
};

export const updateUserRole = async (
  boardId: string,
  userId: string,
  newMode: string,
) => {
  try {
    const joinDocRef = userBoardRef.doc(`${userId}_${boardId}`);
    await joinDocRef.update({
      mode: newMode,
    });
  } catch (error) {}
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
    console.log('Upload failed: ' + JSON.stringify(result));
    return '';
  }
};

export const updateUserProfile = async (
  uid: string,
  updates: {username?: string; photoURL?: string},
) => {
  const userDoc = userRef.doc(uid);

  try {
    await userDoc.update(updates);
  } catch (error) {
    console.log('Error updating profile:', error);
  }
};

export const fetchAvailablePositionsForList = async (
  list: List,
  item: Card,
) => {
  const cardsRef = db.collection('lists').doc(list.list_id).collection('cards');
  const snapshot = await cardsRef.orderBy('position').get();

  const cardCount = snapshot.docs.length;
  let positions: number[];

  if (list.list_id === item.list_id) {
    positions = Array.from({length: cardCount}, (_, i) => i + 1);
    return {positions, defaultPos: item.position};
  } else {
    positions = Array.from({length: cardCount + 1}, (_, i) => i + 1);
    return {positions, defaultPos: cardCount + 1};
  }
};

interface Card {
  id: string;
  list_id: string;
  position: number;
  createdAt?: string;
  [key: string]: any;
}

export interface List {
  list_id: string;
  [key: string]: any;
}

interface MoveCardParams {
  item: Card;
  selectedList: List;
  selectedPosition: number | null;
  availablePositions: number[];
  onSuccess: () => void;
  onError: (err: any) => void;
}

export const moveCardToList = async ({
  item,
  selectedList,
  selectedPosition,
  availablePositions,
  onSuccess,
  onError,
}: MoveCardParams) => {
  const targetPosition = selectedPosition ?? availablePositions.at(-1) ?? 1;
  const oldListId = item.list_id;
  const newListId = selectedList.list_id;

  if (oldListId === newListId && item.position === targetPosition) {
    console.log('Skipping: same position and list');
    return;
  }

  try {
    const batch = db.batch();

    const listCardsRef = listRef.doc(oldListId).collection('cards');

    if (oldListId === newListId) {
      const from = item.position;
      const to = targetPosition;

      const snapshot = await listCardsRef.get();
      snapshot.forEach(docSnap => {
        const card = docSnap.data() as Card;
        if (card.id === item.id) return;

        if (from < to && card.position > from && card.position <= to) {
          batch.update(docSnap.ref, {position: card.position - 1});
        } else if (from > to && card.position >= to && card.position < from) {
          batch.update(docSnap.ref, {position: card.position + 1});
        }
      });

      batch.update(listCardsRef.doc(item.id), {position: to});
    } else {
      const oldListRef = listRef.doc(oldListId).collection('cards');
      const snapshotOld = await oldListRef
        .where('position', '>', item.position)
        .get();

      snapshotOld.forEach(docSnap => {
        batch.update(docSnap.ref, {
          position: docSnap.data().position - 1,
        });
      });

      const newListRef = listRef.doc(newListId).collection('cards');
      const snapshotNew = await newListRef.orderBy('position', 'asc').get();

      let index = 1;
      snapshotNew.forEach(docSnap => {
        const docPos = docSnap.data().position;
        if (index === targetPosition) {
          index++;
        }
        batch.update(docSnap.ref, {position: index});
        index++;
      });

      const newCard: Card = {
        ...item,
        list_id: newListId,
        position: targetPosition,
        createdAt: new Date().toISOString(),
      };

      batch.delete(oldListRef.doc(item.id));
      batch.set(newListRef.doc(item.id), newCard);
    }

    await batch.commit();
    onSuccess();
  } catch (err) {
    onError(err);
  }
};
