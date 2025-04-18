import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Board, Colors, FakeTaskList, TaskItem, TaskList} from '@utils/Constant';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {screenHeight, screenWidth} from '@utils/Scaling';
import ListTitleInput from '../list/ListTitleInput';
import {useSharedValue} from 'react-native-reanimated';
import {
  addBoardList,
  deleteBoardList,
  getBoardLists,
  listenToBoardLists,
  updateBoardList,
} from '@config/firebase';
import CustomText from '@components/ui/CustomText';
import ListCard from '../list/ListCard';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {DefaultTheme} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';

import Icon from '@components/global/Icon';

interface BoardCardAreaProps {
  board: Board | any;
}
const BoardCardArea: FC<BoardCardAreaProps> = ({board}) => {
  const [active, setActive] = useState(false);
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [taskList, setTaskList] = useState<Array<TaskList | FakeTaskList>>([
    {list_id: undefined},
  ]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [selectedList, setSelectedList] = useState<TaskList | null>(null);
  const [listTitle, setListTitle] = useState('');
  let dummyTitle: string;

  useEffect(() => {
    const unsubscribe = listenToBoardLists(board.boardId, lists => {
      const sortedLists = [...lists].sort((a, b) => a.position - b.position);
      setTaskList([...sortedLists, {list_id: undefined}]);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const onSaveList = async (title: string | any) => {
    setActive(false);
    await addBoardList(board?.boardId, title, taskList.length);
  };

  useEffect(() => {
    loadBoardLists();
  }, []);

  const loadBoardLists = async () => {
    if (!board) return;
    const lists = await getBoardLists(board?.boardId);
    setTaskList([...lists, {id: undefined}]);
  };

  const onDeleteBoardList = async () => {
    await deleteBoardList(selectedList!.list_id);
    setTaskList(taskList.filter(item => item.list_id != selectedList!.list_id));
    bottomSheetModalRef.current?.close();
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

  const onUpdateList = async () => {
    bottomSheetModalRef.current?.close();
    if (selectedList) {
      await updateBoardList(selectedList, listTitle);
    }
  };
  const onCancleModal = () => {
    setListTitle(dummyTitle);
    bottomSheetModalRef.current?.close();
  };

  const showModal = (list: TaskList | any) => {
    setSelectedList(list);
    setListTitle(list.title);
    dummyTitle = list.title;
    bottomSheetModalRef.current?.present();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <Carousel
        ref={ref}
        height={screenHeight * 0.8}
        width={screenWidth}
        data={taskList}
        autoPlay={false}
        loop={false}
        onProgressChange={progress}
        renderItem={({
          index,
          item,
        }: {
          index: number;
          item: TaskList | FakeTaskList;
        }) => {
          return (
            <>
              {item.list_id && (
                <ListCard
                  key={item.list_id}
                  taskList={item}
                  showModal={() => showModal(item)}
                />
              )}
              {item.list_id === undefined && (
                <View key={index} style={styles.listView}>
                  {!active && (
                    <TouchableOpacity
                      style={styles.listAddBtn}
                      activeOpacity={0.8}
                      onPress={() => setActive(true)}>
                      <CustomText variant="h4" fontFamily="Montserrat-SemiBold">
                        Add List
                      </CustomText>
                    </TouchableOpacity>
                  )}
                  {active && (
                    <ListTitleInput
                      onCancle={() => setActive(false)}
                      onSave={onSaveList}
                    />
                  )}
                </View>
              )}
            </>
          );
        }}
      />
      <Pagination.Basic
        progress={progress}
        data={taskList}
        dotStyle={{backgroundColor: '#ffffff5c', borderRadius: 40}}
        size={8}
        activeDotStyle={{backgroundColor: '#fff'}}
        containerStyle={{gap: 10, marginTop: 10}}
        onPress={onPressPagination}
      />
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

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDeleteBoardList}>
            <Text style={styles.deleteBtnText}>Close Board</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default BoardCardArea;

const styles = StyleSheet.create({
  listView: {
    paddingTop: 20,
    paddingHorizontal: 30,
  },
  listAddBtn: {
    backgroundColor: '#00000047',
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
