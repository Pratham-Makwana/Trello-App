import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Button,
  NativeSyntheticEvent,
  ActivityIndicator,
} from 'react-native';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Colors, FakeTaskList, TaskItem, TaskList} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {
  addCardList,
  deleteBoardList,
  getListCard,
  updateBoardList,
  updateCart,
} from '@config/firebase';
import DraggableFlatList, {
  DragEndParams,
} from 'react-native-draggable-flatlist';
import ListItem from '@components/board/card/ListItem';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import {DefaultTheme} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import cardLoader from '@assets/animation/cardloader.json';
import {screenHeight, screenWidth} from '@utils/Scaling';

interface CardListProps {
  taskList: TaskList | FakeTaskList | any;
  onDeleteBoardList: () => void;
}
const ListCard: FC<CardListProps> = ({taskList, onDeleteBoardList}) => {
  const [listTitle, setListTitle] = useState(taskList?.title);
  let dummyTitle = taskList?.title;
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);

  useEffect(() => {
    loadCardList();
  }, [taskList?.list_id]);

  const loadCardList = async () => {
    setLoading(true);
    try {
      const data = await getListCard(taskList?.list_id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const onTaskCardDrop = (params: DragEndParams<TaskItem>) => {
    console.log('==> onTaskCardDrop Params', params);
    const newData = params.data.map((item: any, index: number) => {
      return {...item, position: index};
    });
    setTasks(newData);
    console.log('newData', newData);
    newData.map(async item => {
      await updateCart(item);
    });
  };

  const onCardAdd = async () => {
    const data = await addCardList(
      taskList?.list_id,
      taskList?.board_id,
      newTask,
      tasks.length,
    );
    setAdding(false);
    setTasks([...tasks, data]);
    setNewTask('');
  };
  const onUpdateList = async () => {
    bottomSheetModalRef.current?.close();
    await updateBoardList(taskList, listTitle);
  };
  const onCancleModal = () => {
    setListTitle(dummyTitle);
    bottomSheetModalRef.current?.close();
  };
  const onDeleteList = async () => {
    bottomSheetModalRef.current?.close();
    await deleteBoardList(taskList?.list_id);
    onDeleteBoardList();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={onCancleModal}
      />
    ),
    [],
  );

  const showModal = () => {
    bottomSheetModalRef.current?.present();
  };
  return (
    <BottomSheetModalProvider>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* List Header */}
          <View style={styles.header}>
            <Text style={styles.listTitle}>{listTitle}</Text>
            <TouchableOpacity onPress={showModal}>
              <Icon
                name="dots-horizontal"
                iconFamily="MaterialCommunityIcons"
                size={22}
                color={Colors.black}
              />
            </TouchableOpacity>
          </View>

          {/* Render Card Tasks */}
          {loading && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size={'large'} color={Colors.lightprimary} />
            </View>
          )}
          {!loading && (
            <DraggableFlatList
              data={tasks}
              renderItem={ListItem}
              keyExtractor={item => item.id}
              onDragEnd={onTaskCardDrop}
              containerStyle={{
                paddingBottom: 4,
                maxHeight: '80%',
              }}
              contentContainerStyle={{gap: 4}}
            />
          )}

          {adding && (
            <TextInput
              style={styles.input}
              value={newTask}
              onChangeText={setNewTask}
              autoCapitalize="none"
              autoFocus
            />
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 8,
              marginVertical: 4,
            }}>
            {!adding && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => setAdding(true)}>
                  <Icon
                    name="plus"
                    iconFamily="MaterialCommunityIcons"
                    size={16}
                    color={Colors.fontDark}
                  />
                  <Text style={{fontSize: 14, color: Colors.black}}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8}>
                  <Icon
                    name="image-outline"
                    iconFamily="MaterialCommunityIcons"
                    size={20}
                    color={Colors.black}
                  />
                </TouchableOpacity>
              </>
            )}
            {adding && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setAdding(false);
                    setNewTask('');
                  }}>
                  <Text style={{fontSize: 14, color: Colors.lightprimary}}>
                    Cancle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={onCardAdd}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.lightprimary,
                      fontWeight: 'bold',
                    }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        handleStyle={{
          backgroundColor: DefaultTheme.colors.background,
          borderRadius: 12,
        }}
        enableOverDrag={false}
        enablePanDownToClose>
        <BottomSheetView style={styles.container}>
          <View
            style={{
              paddingTop: 10,
              alignItems: 'center',
              paddingBottom: 16,
            }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancleModal}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#B4B4B4',
                borderRadius: 50,
                padding: 5,
              }}>
              <Icon name="close" iconFamily="Ionicons" size={22} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginBottom: 16,
            }}>
            <Text
              style={{color: Colors.fontDark, fontSize: 12, marginBottom: 5}}>
              list name
            </Text>
            <TextInput
              style={{fontSize: 16, color: Colors.fontDark}}
              returnKeyType="done"
              enterKeyHint="done"
              onEndEditing={onUpdateList}
              value={listTitle}
              onChangeText={e => setListTitle(e)}
            />
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={onDeleteList}>
            <Text style={styles.deleteBtnText}>Close Board</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ListCard;

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#F3EFFC',
    borderRadius: 4,
    padding: 6,
    // marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    alignItems: 'center',
  },
  listTitle: {
    paddingVertical: 8,
    fontWeight: '500',
    color: Colors.black,
  },
  input: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.2,
    borderRadius: 4,
    color: Colors.black,
  },
  container: {
    backgroundColor: DefaultTheme.colors.background,
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    // padding: 20,
    // gap: 16,
  },

  contentContainer: {
    flex: 1,
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
