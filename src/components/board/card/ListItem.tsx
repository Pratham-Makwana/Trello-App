import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
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
import {deleteCard, updateCart} from '@config/firebase';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ListItem = ({item, drag, isActive}: RenderItemParams<TaskItem>) => {
  const [cardTitle, setCardTitle] = useState(item.title);
  const [cardDescription, setCardDescription] = useState(item.description);
  const descriptionInputRef = useRef<TextInput>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);

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

  return (
    <>
      <AnimatedTouchable
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
              }}>
              <Text style={{flex: 1, color: Colors.black}}>{item.title}</Text>
              <TouchableOpacity
                onPress={() =>
                  navigate('ListCardDetails', {cardDetails: item})
                }>
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
            <View>
              <Text style={{color: Colors.fontDark}}>{item.title}</Text>
            </View>
            <TouchableOpacity
              onPress={() => bottomSheetModalRef.current?.present()}>
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
});
