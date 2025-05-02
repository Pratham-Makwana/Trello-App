import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {DefaultTheme, useRoute} from '@react-navigation/native';
import {Board, Colors, FakeTaskList, TaskList} from '@utils/Constant';
import CustomHeaderIOS from '@components/global/CustomHeaderIOS';
import CustomHeaderAndroid from '@components/global/CustomHeaderAndroid';
import LinearGradient from 'react-native-linear-gradient';
import CustomModal from '@components/global/CustomModal';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {updateBoard, updateBoardTitle} from '@store/board/boardSlice';
import {resetAndNavigate} from '@utils/NavigationUtils';
import {
  addBoardList,
  deleteBoardList,
  getBoardInfo,
  listenToBoardLists,
  listenToUpdateBoardInfo,
  updateBoardList,
} from '@config/firebaseRN';
import Icon from '@components/global/Icon';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import CustomText from '@components/ui/CustomText';
import ListTitleInput from '../list/ListTitleInput';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import ListCard from '../list/ListCard';
import {screenHeight, screenWidth} from '@utils/Scaling';
import {useSharedValue} from 'react-native-reanimated';
import CustomLoading from '@components/global/CustomLoading';

const BoardCard = () => {
  const route = useRoute();
  const dispatch = useAppDispatch();
  const {boardDetails} = route.params as {boardDetails: Board};
  const {user} = useUser();
  const [loading, setLoading] = useState(false);
  const [loadLoader, setLoadLoader] = useState(false);
  const [board, setBoard] = useState<Board | any>();
  const [active, setActive] = useState(false);
  const [taskList, setTaskList] = useState<Array<TaskList | FakeTaskList>>([
    {list_id: undefined},
  ]);
  const [listTitle, setListTitle] = useState('');
  const [selectedList, setSelectedList] = useState<TaskList | null>(null);
  const ref = useRef<ICarouselInstance>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const progress = useSharedValue<number>(0);
  const snapPoints = useMemo(() => ['70%'], []);
  let dummyTitle: string;

  const currentBoard = useAppSelector(state =>
    state.board.boards.find(b => b.boardId === boardDetails.boardId),
  );

  useEffect(() => {
    if (!currentBoard) resetAndNavigate('UserBottomTab');
  }, [currentBoard]);

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(
      boardDetails.boardId,
      user!.uid,
      updatedBoard => {
        setBoard(updatedBoard);
        dispatch(updateBoard(updatedBoard));
      },
    );

    return () => unsubscribe();
  }, []);

  const gradientColors =
    currentBoard?.background.length === 1
      ? [currentBoard?.background[0], currentBoard?.background[0]]
      : currentBoard?.background || ['#ffffff', '#ffffff'];

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

  const onDeleteBoardList = async () => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list? All tasks in this list will also be removed.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoadLoader(true);
            await deleteBoardList(
              selectedList!.list_id,
              selectedList!.board_id,
              selectedList!.position,
            );
            setTaskList(
              taskList.filter(item => item.list_id != selectedList!.list_id),
            );
            setLoadLoader(false);
            bottomSheetModalRef.current?.close();
          },
        },
      ],
    );
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

  const handleActive = () => {
    if (board.workspace == 'Private' && board.role == 'member') {
      console.log('Access Denied');

      Toast.show({
        type: 'info',
        text1: 'Access Denied',
        text2: 'You cannot add a list in a private workspace.',
      });
      return;
    }
    setActive(true);
  };

  useEffect(() => {
    const loadBoardInfo = async () => {
      setLoading(true);
      const data = await getBoardInfo(boardDetails?.boardId, user!.uid);
      dispatch(updateBoard(data));
      setBoard(data);
      setLoading(false);
    };

    loadBoardInfo();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToBoardLists(boardDetails.boardId, lists => {
      setTaskList([...lists, {list_id: undefined}]);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const onListChangePosition = async (newPosition: number) => {
    if (!selectedList || selectedList.position === newPosition) return;

    setLoadLoader(true);

    const currentList = selectedList;
    const currentPosition = currentList.position;

    const updatedLists: TaskList[] = [];

    if (newPosition < currentPosition) {
      taskList.forEach(list => {
        if (
          'position' in list &&
          list?.position >= newPosition &&
          list.position < currentPosition &&
          list.list_id !== currentList.list_id
        ) {
          updatedLists.push({...list, position: list.position + 1});
        }
      });
    } else {
      taskList.forEach(list => {
        if (
          'position' in list &&
          list.position <= newPosition &&
          list.position > currentPosition &&
          list.list_id !== currentList.list_id
        ) {
          updatedLists.push({...list, position: list.position - 1});
        }
      });
    }

    updatedLists.push({...currentList, position: newPosition});

    for (const list of updatedLists) {
      await updateBoardList(list, list.title, list.position);
    }
    setLoadLoader(false);
    bottomSheetModalRef.current?.close();
  };

  return (
    <LinearGradient colors={gradientColors} style={{flex: 1}}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
      {Platform.OS === 'ios' && (
        <CustomHeaderIOS
          title={currentBoard!.title}
          // board={board}
          boardId={currentBoard?.boardId || ''}
        />
      )}
      {Platform.OS === 'android' && (
        <CustomHeaderAndroid
          title={currentBoard?.title || 'Untitled'}
          // board={board}
          boardId={currentBoard?.boardId || ''}
        />
      )}
      {loading && <CustomModal loading={loading} />}
      {board && (
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
                      disable={
                        board.role == 'member' && board.workspace == 'Private'
                      }
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
                          onPress={handleActive}>
                          <CustomText
                            variant="h4"
                            fontFamily="Montserrat-SemiBold">
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
              {loadLoader && <CustomLoading />}
              <View style={styles.cancleBtnContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onCancleModal}
                  style={styles.cancleBtn}>
                  <Icon name="close" iconFamily="Ionicons" size={22} />
                </TouchableOpacity>
              </View>

              <View style={styles.textInputContainer}>
                <Text style={styles.labelText}>list name</Text>
                <TextInput
                  style={{fontSize: 16, color: Colors.fontDark}}
                  returnKeyType="done"
                  enterKeyHint="done"
                  onEndEditing={onUpdateList}
                  value={listTitle}
                  onChangeText={e => setListTitle(e)}
                />
              </View>

              <View style={styles.positionContainer}>
                <Text style={styles.labelText}>Change List Position</Text>
                <View style={styles.positionList}>
                  {taskList
                    .filter(list => list.list_id !== undefined)
                    .map((item, idx) => (
                      <TouchableOpacity
                        key={item.list_id}
                        style={[
                          styles.positionBtn,
                          selectedList?.position === idx + 1 &&
                            styles.positionBtnActive,
                        ]}
                        onPress={() => onListChangePosition(idx + 1)}>
                        <Text
                          style={[
                            styles.positionText,
                            selectedList?.position === idx + 1 &&
                              styles.positionTextActive,
                          ]}>
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={onDeleteBoardList}>
                <Text style={styles.deleteBtnText}>Close Board</Text>
              </TouchableOpacity>
            </BottomSheetView>
          </BottomSheetModal>
        </SafeAreaView>
      )}
    </LinearGradient>
  );
};

export default BoardCard;

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
  },

  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  textInputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
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
  cancleBtnContainer: {
    paddingTop: 10,
    alignItems: 'center',
    paddingBottom: 16,
  },
  cancleBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B4B4B4',
    borderRadius: 50,
    padding: 5,
  },
  labelText: {
    color: Colors.fontDark,
    fontSize: 12,
    marginBottom: 5,
  },

  positionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  positionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  positionBtn: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  positionBtnActive: {
    backgroundColor: '#007AFF',
  },
  positionText: {
    color: Colors.fontDark,
  },
  positionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
