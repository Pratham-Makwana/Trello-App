import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {RenderItemParams} from 'react-native-draggable-flatlist';
import {Colors, labelColors, TaskItem} from '@utils/Constant';
import Animated, {runOnJS} from 'react-native-reanimated';
import Icon from '@components/global/Icon';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {DefaultTheme} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {RFValue} from 'react-native-responsive-fontsize';
import {
  updateCart,
  deleteCard,
  getListsByBoardId,
  fetchAvailablePositionsForList,
  moveCardToList,
  List,
} from '@config/firebaseRN';
import CheckBox from '@react-native-community/checkbox';
import {useAppSelector} from '@store/reduxHook';
import MoveList from './MoveList';
import DatePicker from 'react-native-date-picker';
import {format} from 'date-fns';
import {SelectList} from 'react-native-dropdown-select-list';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ListItemProps = RenderItemParams<TaskItem> & {
  disableDrag: boolean;
};

const ListItem = ({
  item,
  drag,
  isActive,
  getIndex,
  disableDrag,
}: ListItemProps) => {
  // const ListItem = ({item, drag, isActive}: RenderItemParams<TaskItem>) => {
  const [cardTitle, setCardTitle] = useState(item.title);
  const [cardDescription, setCardDescription] = useState(item.description);
  const descriptionInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const bottomSheetModalCardRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const [isDone, setIsDone] = useState(item.done);
  const [BoardList, setBoardList] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any | null>(null);
  const [availablePositions, setAvailablePositions] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | ''>(
    item?.startDate
      ? new Date(
          item.startDate.seconds * 1000 + item.startDate.nanoseconds / 1000000,
        )
      : '',
  );
  const [endDate, setEndDate] = useState<Date | ''>(
    item?.endDate
      ? new Date(
          item?.endDate.seconds * 1000 + item?.endDate.nanoseconds / 1000000,
        )
      : '',
  );

  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [labels, setLabels] = useState({
    title: item?.label?.title || '',
    color: item?.label?.color || labelColors[0],
  });
  const [selected, setSelected] = useState('');

  const currentBoard = useAppSelector(state =>
    state.board.boards.find(b => b.boardId === item.board_id),
  );

  useEffect(() => {
    setIsDone(item?.done);
    setCardDescription(item?.description);
    setCardTitle(item?.title);
    setLabels({
      title: item?.label?.title || '',
      color: item?.label?.color || labelColors[0],
    });
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

  const onSelectList = async (list: List) => {
    setSelectedList(list);
    const {positions, defaultPos} = await fetchAvailablePositionsForList(
      list,
      item,
    );
    setAvailablePositions(positions);
    setSelectedPosition(defaultPos);
  };

  const onMoveCard = async () => {
    if (!selectedList) return;

    await moveCardToList({
      item,
      selectedList,
      selectedPosition,
      availablePositions,
      onSuccess: () => {
        bottomSheetModalCardRef.current?.close();
        setSelectedList(null);
        setSelectedPosition(null);
      },
      onError: err => console.error('Error moving card:', err),
    });
  };

  const onConfirmDate = async (date: Date, type: 'start' | 'end') => {
    if (type === 'start') {
      console.log('Start Date:', date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        setOpenStartDate(false);
        Alert.alert('Start Date must be later than today.');
        return;
      }

      await updateCart({
        ...item,
        startDate: date,
      });
      setStartDate(date);
      setOpenStartDate(false);
    } else {
      if (startDate && date <= new Date(startDate)) {
        setOpenEndDate(false);
        Alert.alert('End Date must be later than Start Date.');
        return;
      }

      await updateCart({
        ...item,
        endDate: date,
      });
      setEndDate(date);
      setOpenEndDate(false);
    }
  };

  const onUpdateCardLabel = async (updatedLabels = labels) => {
    if (updatedLabels?.title.length > 0) {
      await updateCart({
        ...item,
        label: {
          title: updatedLabels.title,
          color: updatedLabels.color,
        },
      });
    }
  };
  return (
    <>
      <AnimatedTouchable
        onPress={disableDrag ? () => {} : showModal}
        activeOpacity={1}
        onLongPress={!disableDrag ? drag : undefined}
        disabled={isActive}
        style={[styles.rowItem]}>
        {item?.imageUrl && (
          <>
            <Image source={{uri: item?.imageUrl}} style={styles.image} />

            <View>
              <View style={styles.labelWrapper}>
                {item?.label?.color && (
                  <View
                    style={[styles.label, {backgroundColor: item.label.color}]}>
                    {item.label.title && (
                      <Text style={styles.labelText}>{item.label.title}</Text>
                    )}
                  </View>
                )}
              </View>

              <View style={styles.taskRow}>
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
                  style={[
                    styles.taskText,
                    {textDecorationLine: isDone ? 'line-through' : 'none'},
                  ]}>
                  {item.title}
                </Text>
                <TouchableOpacity
                  disabled={disableDrag}
                  onPress={showCardModal}>
                  <Icon
                    name="resize-outline"
                    iconFamily="Ionicons"
                    size={18}
                    color={Colors.fontDark}
                  />
                </TouchableOpacity>
              </View>
              {item?.startDate && (
                <View style={styles.dateChip}>
                  <Icon
                    name="clock-outline"
                    iconFamily="MaterialCommunityIcons"
                    size={16}
                    color={Colors.fontDark}
                  />
                  <View>
                    <Text style={styles.dateText}>
                      {format(new Date(startDate), 'dd MMM yyyy')}
                      {item?.endDate
                        ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                        : ''}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {!item?.imageUrl && (
          <View>
            <View style={styles.labelWrapper}>
              {item?.label?.color && (
                <View
                  style={[styles.label, {backgroundColor: item.label.color}]}>
                  {item.label.title && (
                    <Text style={styles.labelText}>{item.label.title}</Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.taskRowSpace}>
              <View style={styles.checkboxAndTextWrapper}>
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
              <TouchableOpacity disabled={disableDrag} onPress={showCardModal}>
                <Icon
                  name="resize-outline"
                  iconFamily="Ionicons"
                  size={18}
                  color={Colors.fontDark}
                />
              </TouchableOpacity>
            </View>

            {item?.startDate && (
              <View style={styles.dateChip}>
                <Icon
                  name="clock-outline"
                  iconFamily="MaterialCommunityIcons"
                  size={16}
                  color={Colors.fontDark}
                />
                <View>
                  <Text style={styles.dateText}>
                    {format(new Date(startDate), 'dd MMM yyyy')}
                    {item?.endDate
                      ? ` - ${format(new Date(endDate), 'dd MMM yyyy')}`
                      : ''}
                  </Text>
                </View>
              </View>
            )}
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

            {/* Assign User */}
            <View
              style={{
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 16,
              }}>
              <Text
                style={{color: Colors.fontDark, fontSize: 12, marginBottom: 5}}>
                Assign to Member
              </Text>
            </View>

            {/* Description Input */}
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

            {/* Label Title */}
            <View
              style={{
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 16,
              }}>
              <Text
                style={{color: Colors.fontDark, fontSize: 12, marginBottom: 5}}>
                Label Title
              </Text>
              <TextInput
                value={labels.title}
                onChangeText={text => setLabels({...labels, title: text})}
                style={styles.input}
                placeholder="Label Title"
                placeholderTextColor={Colors.placeholdertext}
                returnKeyType="done"
                enterKeyHint="done"
                // onEndEditing={onUpdateCardLabel}
                onEndEditing={e => {
                  const text = e.nativeEvent.text;
                  const updatedLabels = {...labels, title: text};
                  setLabels(updatedLabels);
                  onUpdateCardLabel(updatedLabels);
                }}
              />
            </View>

            {/* Color Picker */}
            <View
              style={{
                backgroundColor: '#fff',
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginBottom: 16,
              }}>
              <Text
                style={{color: Colors.fontDark, fontSize: 12, marginBottom: 5}}>
                Select Color
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {labelColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      const updatedLabels = {...labels, color};
                      setLabels(updatedLabels);
                      onUpdateCardLabel(updatedLabels);
                    }}
                    style={{
                      backgroundColor: color,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 8,
                      borderWidth: labels?.color === color ? 2 : 0,
                      borderColor:
                        labels?.color === color ? '#000' : 'transparent',
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Date Picker for Start and End Date */}
            <View>
              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginBottom: 16,
                }}
                onPress={() => setOpenStartDate(true)}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                  <Text
                    style={{
                      color: Colors.fontDark,
                      fontSize: 12,
                      marginBottom: 5,
                    }}>
                    Start Date
                  </Text>
                  <Text
                    style={{
                      color: Colors.fontDark,
                      fontSize: 12,
                      marginBottom: 5,
                    }}>
                    {!startDate
                      ? 'Start Date Not Selected'
                      : format(new Date(startDate), 'dd MMM yyyy')}
                  </Text>
                </View>
              </TouchableOpacity>

              <DatePicker
                title="Select Start Date"
                mode="date"
                modal
                // minimumDate={new Date()}
                open={openStartDate}
                date={startDate || date}
                onConfirm={date => onConfirmDate(date, 'start')}
                onCancel={() => setOpenStartDate(false)}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: '#fff',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginBottom: 16,
                }}
                onPress={() => setOpenEndDate(true)}>
                <View
                  style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                  <Text
                    style={{
                      color: Colors.fontDark,
                      fontSize: 12,
                      marginBottom: 5,
                    }}>
                    End Date
                  </Text>
                  <Text
                    style={{
                      color: Colors.fontDark,
                      fontSize: 12,
                      marginBottom: 5,
                    }}>
                    {!endDate
                      ? 'endDate Date Not Selected'
                      : format(new Date(endDate), 'dd MMM yyyy')}
                  </Text>
                </View>
              </TouchableOpacity>

              <DatePicker
                title="Select End Date"
                mode="date"
                modal
                open={openEndDate}
                date={endDate || date}
                onConfirm={date => onConfirmDate(date, 'end')}
                onCancel={() => setOpenEndDate(false)}
              />
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDeleteBoardCard(item)}>
              <Text style={styles.deleteBtnText}>Close Card</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Move List  */}
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
              <View style={styles.headerContainer}>
                <Text style={styles.boardTitle}>{currentBoard?.title}</Text>
                <TouchableOpacity
                  disabled={
                    !selectedList ||
                    selectedPosition === null ||
                    (selectedList.list_id === item.list_id &&
                      selectedPosition === item.position)
                  }
                  onPress={onMoveCard}
                  style={[
                    styles.moveButton,
                    (!selectedList ||
                      selectedPosition === null ||
                      (selectedList.list_id === item.list_id &&
                        selectedPosition === item.position)) &&
                      styles.moveButtonDisabled,
                  ]}>
                  <Text
                    style={[
                      styles.moveButtonText,
                      (!selectedList ||
                        selectedPosition === null ||
                        (selectedList.list_id === item.list_id &&
                          selectedPosition === item.position)) &&
                        styles.moveButtonTextDisabled,
                    ]}>
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
            ListEmptyComponent={() => (
              <Text
                style={{
                  textAlign: 'center',
                  color: Colors.fontDark,
                  fontSize: 16,
                }}>
                No Lists Found
              </Text>
            )}
          />
          {selectedList && (
            <View style={styles.positionContainer}>
              <Text style={styles.positionLabel}>Select Position</Text>
              <FlatList
                horizontal
                data={availablePositions}
                keyExtractor={item => item.toString()}
                renderItem={({item: pos}) => (
                  <TouchableOpacity
                    onPress={() => setSelectedPosition(pos)}
                    style={[
                      styles.positionButton,
                      selectedPosition === pos && styles.positionButtonSelected,
                    ]}>
                    <Text
                      style={[
                        styles.positionText,
                        selectedPosition === pos && styles.positionTextSelected,
                      ]}>
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
  },

  contentContainer: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: Colors.grey,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    backgroundColor: '#f3f3f3',
  },

  labelWrapper: {
    marginHorizontal: 5,
    marginBottom: 2,
  },
  label: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    gap: 10,
  },
  taskRowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskText: {
    flex: 1,
    color: Colors.black,
  },
  checkboxAndTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 6,
    gap: 5,
  },
  dateText: {
    color: Colors.black,
    fontSize: RFValue(11),
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  headerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  boardTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moveButton: {
    backgroundColor: Colors.lightprimary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  moveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  moveButtonText: {
    color: Colors.white,
    fontWeight: '500',
  },
  moveButtonTextDisabled: {
    color: Colors.textgrey,
  },
  positionContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 50,
  },
  positionLabel: {
    marginBottom: 8,
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  positionButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
  },
  positionButtonSelected: {
    backgroundColor: Colors.lightprimary,
  },
  positionText: {
    color: Colors.fontDark,
  },
  positionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
});
