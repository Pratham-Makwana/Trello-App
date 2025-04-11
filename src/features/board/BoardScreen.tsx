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
import {Board, Colors, DarkColors} from '@utils/Constant';
import {
  DefaultTheme,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {auth, getAllBoards} from '@config/firebase';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '@utils/NavigationUtils';

const BoardScreen = () => {
  const [boards, setBoards] = useState<Board[] | any>([]);
  const [refreshing, setRefreshing] = useState(false);

  // const loginUser = auth;
  // console.log('==> BoardScreen:loginUser: ', loginUser);

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, []),
  );

  const fetchBoards = async () => {
    try {
      const allBoard = await getAllBoards();
      setBoards(allBoard);
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

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
  return (
    <View style={styles.boardContainer}>
      <StatusBar backgroundColor={DefaultTheme.colors.text} />
      <FlatList
        contentContainerStyle={
          boards && boards.length > 0 ? styles.list : undefined
        }
        data={boards}
        renderItem={ListItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              // backgroundColor : 'red',
              backgroundColor: Colors.grey,
              marginStart: 50,
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchBoards} />
        }
      />
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
});
