import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from '@components/global/Icon';
import {Board, Colors, User} from '@utils/Constant';

import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {
  deleteBoard,
  getBoardInfo,
  getBoardMembers,
  listenToUpdateBoardInfo,
  updateBoardInfo,
} from '@config/firebase';
import UserList from '@components/board/UserList';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {useAppDispatch} from '@store/reduxHook';
import {closeBoard, updateBoardTitle} from '@store/board/boardSlice';

const BoardMenu = () => {
  const route =
    useRoute<RouteProp<{BoardMenu: {boardId: string; board: Board}}>>();
  const {boardId, board} = route.params;
  const [boardData, setBoardData] = useState<Board | any>();
  const [member, setMember] = useState<User | any>();
  const dispacth = useAppDispatch();
  const {user} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadBoardInfo();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBoardMemebers();
    }, []),
  );

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(boardId, updatedBoard => {
      setBoardData(updatedBoard);
    });

    return () => unsubscribe();
  }, []);

  const loadBoardInfo = async () => {
    setIsLoading(true);
    const data = await getBoardInfo(boardId, user!.uid);
    setBoardData(data);
    setIsLoading(false);
  };

  const fetchBoardMemebers = async () => {
    setIsLoading(true);
    const member = await getBoardMembers(boardId);
    setMember(member);
    setIsLoading(false);
  };

  const onDeleteBoard = async () => {
    await deleteBoard(boardId);
    dispacth(closeBoard(boardId));
    resetAndNavigate('UserBottomTab');
  };

  const onUpdateBoard = async () => {
    await updateBoardInfo(boardData);
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
        <View style={styles.rowGap}>
          <Icon
            name="person-outline"
            iconFamily="Ionicons"
            size={18}
            color={Colors.fontDark}
          />
          <Text
            style={{fontSize: 16, fontWeight: 'bold', color: Colors.fontDark}}>
            Memebers
          </Text>
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

      <TouchableOpacity style={styles.deleteBtn} onPress={onDeleteBoard}>
        <Text style={styles.deleteBtnText}>Close Board</Text>
      </TouchableOpacity>
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
  inviteBtn: {
    backgroundColor: Colors.lightprimary,
    padding: 8,
    marginLeft: 32,
    marginRight: 16,
    marginTop: 8,
    borderRadius: 6,
    alignItems: 'center',
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
