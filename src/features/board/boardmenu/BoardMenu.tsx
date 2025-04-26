import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from '@components/global/Icon';
import {Board, Colors, User} from '@utils/Constant';

import {RouteProp, useRoute} from '@react-navigation/native';

import {
  listenToUpdateBoardInfo,
  updateBoardInfo,
  deleteBoard,
  getBoardInfo,
  leaveBoard,
  listenToBoardMembers,
} from '@config/firebaseRN';
import UserList from '@components/board/UserList';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {useAppDispatch} from '@store/reduxHook';
import {closeBoard} from '@store/board/boardSlice';
import Toast from 'react-native-toast-message';

const BoardMenu = () => {
  const route =
    useRoute<RouteProp<{BoardMenu: {boardId: string; board: Board}}>>();
  const {boardId, board} = route.params;
  const [boardData, setBoardData] = useState<Board | any>();
  const [member, setMember] = useState<User | any>();
  const {user} = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadBoardInfo();
  }, []);
  useEffect(() => {
    const unsubscribe = listenToBoardMembers(boardId, (members: User[]) => {
      setMember(members);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(
      boardId,
      user!.uid,
      updatedBoard => {
        setBoardData(updatedBoard);
      },
    );

    return () => unsubscribe();
  }, []);

  const loadBoardInfo = async () => {
    const data = await getBoardInfo(boardId, user!.uid);
    setBoardData(data);
    setIsLoading(false);
  };

  // const fetchBoardMemebers = async () => {
  //   setIsLoading(true);
  //   const member = await getBoardMembers(boardId);
  //   console.log('==> member', member);

  //   setMember(member);
  //   setIsLoading(false);
  // };

  const onDeleteBoard = async () => {
    await deleteBoard(boardId);
    dispatch(closeBoard(boardId));
    resetAndNavigate('UserBottomTab');
  };

  const onLeaveBoard = async () => {
    leaveBoard(boardId, user!.uid);
    dispatch(closeBoard(boardId));
    resetAndNavigate('UserBottomTab');
  };

  const onUpdateBoard = async () => {
    await updateBoardInfo(boardData);
  };

  const onUpdateBoardVisibility = async (visibility: string) => {
    console.log('==> onUpdateBoardVisibility', member);

    const currentUser = member.find((item: User) => item.uid === user!.uid);
    console.log('==> currentUser', currentUser);

    if (currentUser?.role !== 'creator') {
      Toast.show({
        type: 'error',
        text1: 'You are not allowed to change the visibility',
        position: 'bottom',
      });
      return;
    }
    const updated = {...boardData, workspace: visibility};
    setBoardData(updated);
    await updateBoardInfo(updated);
  };
  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.label}>Board Name</Text>
        {isLoading && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size={'large'} color={Colors.lightprimary} />
          </View>
        )}
        {!isLoading && (
          <TextInput
            value={boardData?.title}
            onChangeText={text => setBoardData({...boardData, title: text})}
            style={{fontSize: 16, color: Colors.fontDark}}
            returnKeyType="done"
            enterKeyHint="done"
            onEndEditing={onUpdateBoard}
          />
        )}
      </View>
      {/* Memebers */}
      <View style={styles.container}>
        <View style={styles.rowSpaceBetween}>
          <View style={styles.rowGap}>
            <Icon
              name="person-outline"
              iconFamily="Ionicons"
              size={18}
              color={Colors.fontDark}
            />
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: Colors.fontDark,
              }}>
              Memebers
            </Text>
          </View>
        </View>
        {isLoading && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 10,
            }}>
            <ActivityIndicator size={'large'} color={Colors.lightprimary} />
          </View>
        )}
        {!isLoading && (
          <FlatList
            data={member}
            keyExtractor={item => item.uid}
            renderItem={({item}) => <UserList member={item} />}
            contentContainerStyle={{gap: 8}}
            style={{marginVertical: 12}}
          />
        )}

        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() =>
            navigate('Invite', {boardId, title: boardData?.title})
          }>
          <Text style={{fontSize: 16, color: Colors.grey}}>Invite...</Text>
        </TouchableOpacity>
      </View>

      {/* Visibility Settings */}
      <View style={styles.container}>
        <Text style={styles.label}>Visibility</Text>
        <View style={styles.visibilityContainer}>
          {['Workspace', 'Private'].map(option => (
            <TouchableOpacity
              activeOpacity={0.8}
              key={option}
              style={[
                styles.visibilityOption,
                boardData?.workspace === option && styles.selectedVisibility,
              ]}
              onPress={() => onUpdateBoardVisibility(option)}>
              <Text
                style={[
                  styles.visibilityText,
                  boardData?.workspace === option && styles.selectedText,
                ]}>
                {option === 'Workspace' ? 'Workspace' : 'Private'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {boardData?.role == 'creator' && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDeleteBoard}>
          <Text style={styles.deleteBtnText}>Close Board</Text>
        </TouchableOpacity>
      )}
      {boardData?.role == 'member' && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onLeaveBoard}>
          <Text style={styles.deleteBtnText}>Leave Board</Text>
        </TouchableOpacity>
      )}
      <Toast />
    </View>
  );
};

export default BoardMenu;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 8,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  label: {
    color: Colors.textgrey,
    fontSize: 12,
    marginBottom: 5,
  },
  rowGap: {
    flexDirection: 'row',
    gap: 16,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteBtn: {
    backgroundColor: Colors.lightprimary,
    padding: 8,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedVisibility: {
    backgroundColor: Colors.lightprimary,
  },
  visibilityText: {
    fontSize: 14,
    color: Colors.fontDark,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
  },
  notice: {
    fontSize: 12,
    color: 'red',
    marginTop: 6,
  },

  deleteBtn: {
    backgroundColor: '#fff',
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#B22222',
  },
});
