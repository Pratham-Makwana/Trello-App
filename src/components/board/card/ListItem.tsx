import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {RenderItemParams} from 'react-native-draggable-flatlist';
import {Colors, TaskItem} from '@utils/Constant';
import Animated, {runOnJS} from 'react-native-reanimated';
import Icon from '@components/global/Icon';
import {navigate} from '@utils/NavigationUtils';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {DefaultTheme} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {db, deleteCard, getListsByBoardId, updateCart} from '@config/firebase';
import CheckBox from '@react-native-community/checkbox';
import {useAppSelector} from '@store/reduxHook';
import MoveList from './MoveList';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ListItem = ({item, drag, isActive}: RenderItemParams<TaskItem>) => {
  const [cardTitle, setCardTitle] = useState(item.title);
  const [cardDescription, setCardDescription] = useState(item.description);
  const descriptionInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalCardRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [isDone, setIsDone] = useState(item.done);
  const [BoardList, setBoardList] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [availablePositions, setAvailablePositions] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const currentBoard = useAppSelector(state =>
    state.board.boards.find(b => b.boardId === item.board_id),
  );

  useEffect(() => {
    setIsDone(item.done);
    setCardDescription(item.description);
    setCardTitle(item.title);
  }, [item]);

  const loadGetListsByBoardId = async () => {
    try {
      const data = await getListsByBoardId(item.board_id);
      setBoardList(data);
    } catch (error) {
      console.error('Error fetching lists for board:', error);
    }
  };

  const onDeleteBoardCard = async (item: TaskItem) => {
    try {
      await deleteCard(item);
      runOnJS(() => {
        bottomSheetModalRef.current?.close();
      })();
    } catch (error) {
      console.log('Error deleting card:', error);
    }
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

  const onUpdateCardTitle = async () => {
    try {
      const updatedCard = {
        ...item,
        title: cardTitle,
      };
      await updateCart(updatedCard);
      runOnJS(() => {
        bottomSheetModalRef.current?.close();
      })();
    } catch (error) {
      console.log('Error deleting card:', error);
    }
  };
  const onUpdateCardDescription = async () => {
    try {
      const updatedCard = {
        ...item,
        description: cardDescription,
      };

      await updateCart(updatedCard);
      runOnJS(() => {
        bottomSheetModalRef.current?.close();
      })();
    } catch (error) {
      console.log('Error deleting card:', error);
    }
  };
  const onCancleModal = () => {
    runOnJS(() => {
      bottomSheetModalRef.current?.close();
    })();
  };
  const onCheckDone = async (newValue: boolean) => {
    setIsDone(newValue);
    try {
      const updatedCard = {
        ...item,
        done: newValue,
      };
      await updateCart(updatedCard);
    } catch (error) {
      console.log('Error updating card:', error);
    }
  };

  const showCardModal = async () => {
    await loadGetListsByBoardId();
    runOnJS(() => {
      bottomSheetModalCardRef.current?.present();
    })();
  };
  const showModal = async () => {
    runOnJS(() => {
      bottomSheetModalRef.current?.present();
    })();
  };

  const onSelectList = async (list: any) => {
    setSelectedList(list);

    const cardsRef = collection(db, 'lists', list.list_id, 'cards');
    const snapshot = await getDocs(query(cardsRef, orderBy('position')));

    const cardCount = snapshot.docs.length;

    let positions: number[];

    // If moving within same list
    if (list.list_id === item.list_id) {
      // Include all positions including current card's
      positions = Array.from({length: cardCount}, (_, i) => i + 1);
      setSelectedPosition(item.position); // Default to current
    } else {
      // Moving to a different list
      positions = Array.from({length: cardCount + 1}, (_, i) => i + 1);
      setSelectedPosition(cardCount + 1); // Default to last
    }

    setAvailablePositions(positions);
  };

  const onMoveCard = async () => {
    if (!selectedList) return;

    const targetPosition = selectedPosition ?? availablePositions.at(-1) ?? 1;
    const oldListId = item.list_id;
    const newListId = selectedList.list_id;

    // Prevent useless move
    if (oldListId === newListId && item.position === targetPosition) {
      console.log('Skipping: same position and list');
      return;
    }

    try {
      // 1. Remove from old list
      const oldListRef = collection(db, 'lists', oldListId, 'cards');
      const snapshotOld = await getDocs(
        query(oldListRef, where('position', '>', item.position)),
      );

      const batch = writeBatch(db);
      snapshotOld.forEach(docSnap => {
        batch.update(doc(oldListRef, docSnap.id), {
          position: docSnap.data().position - 1,
        });
      });

      await batch.commit();
      await deleteDoc(doc(oldListRef, item.id));

      // 2. Add to new list
      const newListRef = collection(db, 'lists', newListId, 'cards');
      const snapshotNew = await getDocs(
        query(newListRef, where('position', '>=', targetPosition)),
      );

      const batch2 = writeBatch(db);
      snapshotNew.forEach(docSnap => {
        batch2.update(doc(newListRef, docSnap.id), {
          position: docSnap.data().position + 1,
        });
      });

      const newCard = {
        ...item,
        list_id: newListId,
        position: targetPosition,
        createdAt: new Date().toISOString(),
      };

      const newCardRef = doc(newListRef, item.id);
      batch2.set(newCardRef, newCard);

      await batch2.commit();

      bottomSheetModalCardRef.current?.close();
      setSelectedList(null);
      setSelectedPosition(null);
    } catch (err) {
      console.error('Error moving card:', err);
    }
  };

  return (
    <>
      <AnimatedTouchable
        onPress={showModal}
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.rowItem]}>
        {item?.imageUrl && (
          <>
            <Image
              source={{uri: item?.imageUrl}}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 4,
                backgroundColor: '#f3f3f3',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 5,
                gap: 10,
              }}>
              <CheckBox
                value={isDone}
                onValueChange={onCheckDone}
                tintColors={{
                  true: '#4CAF50',
                  false: '#aaa',
                }}
                boxType="circle"
                style={styles.checkbox}
              />
              <Text style={{flex: 1, color: Colors.black}}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetModalCardRef.current?.present();
                }}>
                <Icon
                  name="resize-outline"
                  iconFamily="Ionicons"
                  size={18}
                  color={Colors.fontDark}
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {!item?.imageUrl && (
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <CheckBox
                value={isDone}
                onValueChange={onCheckDone}
                tintColors={{
                  true: '#4CAF50',
                  false: '#aaa',
                }}
                boxType="circle"
                style={styles.checkbox}
              />
              <Text
                style={{
                  color: isDone ? Colors.fontDark : Colors.black,
                  textDecorationLine: isDone ? 'line-through' : 'none',
                }}>
                {item.title}
              </Text>
            </View>
            <TouchableOpacity onPress={showCardModal}>
              <Icon
                name="resize-outline"
                iconFamily="Ionicons"
                size={18}
                color={Colors.fontDark}
              />
            </TouchableOpacity>
          </View>
        )}
      </AnimatedTouchable>

      {/* BottomSheet For the Card  */}
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

          <View style={styles.contentContainer}>
            {!item?.imageUrl && (
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginBottom: 16,
                }}>
                <Text
                  style={{
                    color: Colors.fontDark,
                    fontSize: 12,
                    marginBottom: 5,
                  }}>
                  Card Name
                </Text>
                <TextInput
                  value={cardTitle}
                  onChangeText={text => setCardTitle(text)}
                  style={styles.input}
                  returnKeyType="done"
                  enterKeyHint="done"
                  onEndEditing={onUpdateCardTitle}
                  placeholder="Card Title"
                  placeholderTextColor={Colors.placeholdertext}
                />
              </View>
            )}
            {item?.imageUrl && (
              <View style={styles.rowItem}>
                <Image
                  source={{uri: item?.imageUrl}}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 4,
                    backgroundColor: '#f3f3f3',
                  }}
                />
              </View>
            )}
            <View style={styles.inputRow}>
              <Icon
                name="description"
                iconFamily="MaterialIcons"
                size={22}
                color={Colors.black}
              />

              <TextInput
                ref={descriptionInputRef}
                placeholder="Enter description"
                placeholderTextColor={Colors.placeholdertext}
                style={styles.descriptionInput}
                multiline
                value={cardDescription}
                onChangeText={setCardDescription}
              />

              <TouchableOpacity
                disabled={cardDescription.length == 0}
                onPress={onUpdateCardDescription}>
                <Text
                  style={
                    cardDescription?.length == 0
                      ? styles.disableButtonText
                      : styles.addButtonText
                  }>
                  Add
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDeleteBoardCard(item)}>
              <Text style={styles.deleteBtnText}>Close Card</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={bottomSheetModalCardRef}
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
        <BottomSheetView>
          <FlatList
            keyExtractor={item => item.list_id}
            data={BoardList}
            ListHeaderComponent={() => (
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                <Text style={{color: Colors.black}}>{currentBoard?.title}</Text>
                <TouchableOpacity
                  disabled={
                    !selectedList ||
                    selectedPosition === null ||
                    (selectedList.list_id === item.list_id &&
                      selectedPosition === item.position)
                  }
                  onPress={onMoveCard}>
                  <Text
                    style={{
                      color:
                        !selectedList ||
                        selectedPosition === null ||
                        (selectedList.list_id === item.list_id &&
                          selectedPosition === item.position)
                          ? Colors.textgrey
                          : Colors.lightprimary,
                    }}>
                    Move
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{marginVertical: 20}}
            renderItem={({item}) => (
              <MoveList
                item={item}
                key={item.id}
                isSelected={item.list_id === selectedList?.list_id}
                onSelectList={onSelectList}
              />
            )}
          />
          {selectedList && (
            <View style={{paddingHorizontal: 16}}>
              <Text style={{marginBottom: 8, color: Colors.black}}>
                Select Position
              </Text>
              <FlatList
                horizontal
                data={availablePositions}
                keyExtractor={item => item.toString()}
                renderItem={({item: pos}) => (
                  <TouchableOpacity
                    onPress={() => setSelectedPosition(pos)}
                    style={{
                      backgroundColor:
                        selectedPosition === pos ? Colors.lightprimary : '#eee',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 8,
                      borderRadius: 4,
                    }}>
                    <Text
                      style={{
                        color:
                          selectedPosition === pos
                            ? Colors.white
                            : Colors.fontDark,
                      }}>
                      {pos}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default ListItem;

const styles = StyleSheet.create({
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
    marginVertical: 20,
    backgroundColor: Colors.grey,
  },
  input: {
    fontSize: RFValue(16),
    color: Colors.fontDark,
    backgroundColor: Colors.white,
  },
  rowItem: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    resizeMode: 'contain',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
    marginBottom: 20,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    color: Colors.lightprimary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disableButtonText: {
    color: Colors.textgrey,
    fontWeight: 'bold',
    marginLeft: 8,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
