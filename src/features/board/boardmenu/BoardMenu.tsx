import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Icon from '@components/global/Icon';
import {Board, Colors, User} from '@utils/Constant';

import {RouteProp, useRoute} from '@react-navigation/native';

import {
  listenToUpdateBoardInfo,
  updateBoardInfo,
  deleteBoard,
  leaveBoard,
  listenToBoardMembers,
} from '@config/firebaseRN';
import UserList from '@components/board/UserList';
import {goBack, navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {closeBoard, updateBoard} from '@store/board/boardSlice';
import Toast from 'react-native-toast-message';
import {BGCOLORS} from '../BGSelect';
import LinearGradient from 'react-native-linear-gradient';
import {setMembers} from '@store/member/memberSlice';
import {sendNotificationToOtherUser} from '@config/firebaseNotification';
import CustomLoading from '@components/global/CustomLoading';

const BoardMenu = () => {
  const route =
    useRoute<RouteProp<{BoardMenu: {boardId: string; board: Board}}>>();
  const {boardId, board} = route.params;
  const [boardData, setBoardData] = useState<Board | any>();
  const {user} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const members = useAppSelector(state => state.member.members);
  const [isClose, setIsClose] = useState(false);
  const previousMembersRef = useRef<User[]>([]);

  // useEffect(() => {
  //   const unsubscribe = listenToBoardMembers(boardId, (members: User[]) => {
  //     if (
  //       JSON.stringify(previousMembersRef.current) !== JSON.stringify(members)
  //     ) {
  //       console.log('==> boardmenu members', members);

  //       previousMembersRef.current = members;
  //       dispatch(setMembers(members));
  //       setIsLoading(prev => (prev ? false : prev));
  //     }

  //     // dispatch(setMembers(members));
  //   });

  //   return () => unsubscribe();
  // }, []);

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(
      boardId,
      user!.uid,
      updatedBoard => {
        if (
          updatedBoard?.role == 'member' &&
          updatedBoard?.workspace == 'Private'
        ) {
          goBack();
        }
        dispatch(updateBoard(updatedBoard));
        setBoardData(updatedBoard);
      },
    );

    return () => unsubscribe();
  }, []);

  const onDeleteBoard = async () => {
    Alert.alert(
      'Delete Board',
      'Are you sure you want to delete this board? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setIsClose(true);
            await deleteBoard(boardId);
            dispatch(closeBoard(boardId));
            setIsClose(true);
            resetAndNavigate('UserBottomTab');
          },
        },
      ],
      {cancelable: true},
    );
  };

  const onLeaveBoard = async () => {
    Alert.alert('Leave Board', 'Are you sure want to leave this board?', [
      {text: 'Cancle', style: 'cancel'},
      {
        text: 'OK',
        onPress: async () => {
          setIsClose(true);
          await leaveBoard(boardId, user!.uid);
          if (boardData?.createdBy) {
            sendNotificationToOtherUser(
              boardData?.createdBy,
              'Board Update',
              `${user?.username} has left the board "${boardData?.title}`,
            );
          }
          dispatch(closeBoard(boardId));
          setIsClose(true);
          resetAndNavigate('UserBottomTab');
        },
      },
    ]);
  };

  const onUpdateBoard = async () => {
    await updateBoardInfo(boardData);
  };

  const handleChangeBg = async (color: string[]) => {
    const updated = {...boardData, background: color};

    await updateBoardInfo(updated);
  };

  const onUpdateBoardVisibility = async (visibility: string) => {
    const currentUser = members.find((item: User) => item.uid === user!.uid);

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

  const handleRemoveUser = (user: User) => {
    Alert.alert(
      'Remove From Board',
      `Are you sure want to remove ${
        user?.username || 'user'
      } from this board?`,
      [
        {text: 'Cancle', style: 'cancel'},
        {
          text: 'OK',
          onPress: async () => {
            console.log(boardData);

            setIsClose(true);
            await leaveBoard(boardId, user!.uid);
            if (user?.uid) {
              sendNotificationToOtherUser(
                user?.uid,
                'Removed from Board',
                `You've been removed from the ${
                  boardData?.title || 'board'
                } by the creator. You no longer have access to this board.`,
              );
            }
            setIsClose(false);
          },
        },
      ],
    );
  };
  return (
    <View>
      {isClose && <CustomLoading />}
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
            editable={
              !(
                boardData?.role === 'member' &&
                boardData?.workspace === 'Workspace'
              )
            }
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
            data={members}
            keyExtractor={item => item.uid}
            renderItem={({item}) => (
              <UserList
                member={item}
                removeUser={true}
                onRemove={handleRemoveUser}
              />
            )}
            contentContainerStyle={{gap: 8}}
            style={{marginVertical: 12}}
          />
        )}

        <TouchableOpacity
          disabled={
            boardData?.role === 'member' && boardData?.workspace === 'Workspace'
          }
          style={styles.inviteBtn}
          onPress={() =>
            navigate('Invite', {boardId, title: boardData?.title})
          }>
          <Text style={{fontSize: 16, color: Colors.grey}}>Invite...</Text>
        </TouchableOpacity>
      </View>

      {/* Change Color */}
      <View style={styles.container}>
        <Text style={styles.label}>Change Color</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowSpaceBetween}>
          {BGCOLORS.map((color, index) => {
            const gradientColors =
              color.length === 1 ? [color[0], color[0]] : color;

            const isSelected =
              JSON.stringify(boardData?.background) === JSON.stringify(color);

            return (
              <TouchableOpacity
                disabled={
                  boardData?.role === 'member' &&
                  boardData?.workspace === 'Workspace'
                }
                activeOpacity={0.8}
                key={index}
                style={[
                  styles.btnContainer,
                  isSelected && {
                    borderWidth: 2,
                    borderColor: Colors.lightprimary,
                  },
                ]}
                onPress={() => handleChangeBg(color)}>
                <LinearGradient
                  colors={gradientColors}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.linearColor}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  btnContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginHorizontal: 5,
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
  linearColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 0.5,
    elevation: 1,
  },
  deleteBtnText: {
    color: '#B22222',
  },
});
