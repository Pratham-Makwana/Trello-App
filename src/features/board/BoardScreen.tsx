import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Board, Colors} from '@utils/Constant';
import {
  DefaultTheme,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import {getBoards, listenToUserBoards} from '@config/firebase';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '@utils/NavigationUtils';
import Icon from '@components/global/Icon';
import CustomModal from '@components/global/CustomModal';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {setBoards} from '@store/board/boardSlice';

const BoardScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useUser();
  const boards = useAppSelector(state => state.board.boards);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = listenToUserBoards(user!.uid, boards => {
      console.log('==> boards', boards);
      // if(boards.)
      dispatch(setBoards(boards));
    });

    return () => unsubscribe();
  }, []);

  // const fetchBoards = async () => {
  //   try {
  //     setIsLoading(true);
  //     const allBoard = await getBoards(user!.uid);
  //     dispatch(setBoards(allBoard));
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error('Error fetching boards:', error);
  //   }
  // };

  const ListItem = ({item}: {item: Board}) => {
    const gradientColors =
      item.background.length === 1
        ? [item.background[0], item.background[0]]
        : item.background;
    return (
      <TouchableOpacity
        style={[styles.boardList]}
        activeOpacity={0.8}
        onPress={() => navigate('BoardCard', {boardDetails: item})}>
        <LinearGradient colors={gradientColors} style={styles.colorBlock} />
        <Text style={styles.titleText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.listHeader}>
        <Text style={styles.titleHeaderText}>YOUR WORKSPACES</Text>
      </View>
      <View style={styles.workspaceContent}>
        <Icon
          name="person-outline"
          iconFamily="MaterialIcons"
          size={24}
          color={Colors.darkprimary}
        />
        <Text style={styles.userTitle}>{user?.username}'s workspace</Text>
      </View>
    </View>
  );
  return (
    <View style={styles.boardContainer}>
      <StatusBar backgroundColor={DefaultTheme.colors.text} />
      {isLoading && <CustomModal loading={isLoading} />}
      {!isLoading && (
        <FlatList
          contentContainerStyle={
            boards && boards.length > 0 ? styles.list : undefined
          }
          data={boards}
          renderItem={ListItem}
          keyExtractor={item => item.boardId}
          ListHeaderComponent={() => <ListHeader />}
          // ListEmptyComponent={() => (
          //   <View
          //     style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
          //     <Text style={{color: Colors.black, fontSize: 18}}>
          //       No Board Avaliable
          //     </Text>
          //   </View>
          // )}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: StyleSheet.hairlineWidth,
                backgroundColor: Colors.grey,
                marginStart: 50,
              }}
            />
          )}
        />
      )}
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    marginVertical: 50,
    backgroundColor: Colors.grey,
  },
  boardList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderColor: Colors.textgrey,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  list: {
    borderColor: Colors.grey,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorBlock: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  titleText: {
    fontSize: 16,
    color: Colors.black,
  },
  listHeader: {
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  titleHeaderText: {
    color: Colors.darkprimary,
    fontSize: 16,
    fontWeight: '600',
  },
  workspaceContent: {
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  userTitle: {
    color: Colors.darkprimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
