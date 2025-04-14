import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
import {Board, Colors} from '@utils/Constant';
import {DefaultTheme, useFocusEffect} from '@react-navigation/native';
import {getBoards} from '@config/firebase';
import LinearGradient from 'react-native-linear-gradient';
import {navigate} from '@utils/NavigationUtils';
import Icon from '@components/global/Icon';
import {useAuthContext} from '@context/UserContext';
import CustomModal from '@components/global/CustomModal';

const BoardScreen = () => {
  const [boards, setBoards] = useState<Board[] | any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuthContext();

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, []),
  );

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const allBoard = await getBoards(user?.uid);
      setBoards(allBoard);
      setIsLoading(false);
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
        <Text style={styles.userTitle}>{user?.displayName}'s workspace</Text>
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
          keyExtractor={item => item.id}
          ListHeaderComponent={() => <ListHeader />}
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
