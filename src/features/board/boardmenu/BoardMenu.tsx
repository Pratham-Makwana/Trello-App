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
import React, {useEffect, useState} from 'react';
import {useAuthContext} from '@context/UserContext';
import Icon from '@components/global/Icon';
import {Board, Colors, User} from '@utils/Constant';

import {RouteProp, useRoute} from '@react-navigation/native';
import {
  deleteBoard,
  getBoardInfo,
  getBoardMembers,
  updateBoardInfo,
} from '@config/firebase';
import UserList from '@components/board/UserList';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import CustomModal from '@components/global/CustomModal';

const BoardMenu = () => {
  const route =
    useRoute<RouteProp<{BoardMenu: {boardId: string; board: Board}}>>();
  const {boardId, board} = route.params;
  const [boardData, setBoardData] = useState<Board | any>();
  const [member, setMember] = useState<User | any>();
  const {user} = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // if (!boardId) return;
    loadBoardInfo();
  }, []);

  const loadBoardInfo = async () => {
    setIsLoading(true);
    const data = await getBoardInfo(boardId, user?.uid);
    setBoardData(data);

    const member = await getBoardMembers(boardId);
    // console.log('==> memebers', member);
    setMember(member);
    setIsLoading(false);
  };

  const onDeleteBoard = async () => {
    await deleteBoard(boardId);
    resetAndNavigate('MainStack', {screen: 'board'});
  };

  const onUpdateBoard = async () => {
    // console.log('==> UpdateBoard');
    const updatedBoardData = await updateBoardInfo(boardData);
    setBoardData(updatedBoardData);
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
          onPress={() => navigate('Invite')}>
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
