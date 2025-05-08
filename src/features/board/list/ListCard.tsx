import React, {FC, RefObject, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import DraggableFlatList, {
  DragEndParams,
  DraggableFlatListProps,
} from 'react-native-draggable-flatlist';
import Toast from 'react-native-toast-message';
import {Colors, FakeTaskList, TaskItem, TaskList} from '@utils/Constant';
import {useFilter} from '@context/FilterContext';
import CustomModal from '@components/global/CustomModal';
import Icon from '@components/global/Icon';
import ListItem from '@components/board/card/ListItem';
import {
  addCardList,
  listenToCardsList,
  updateCart,
  uploadToCloudinary,
} from '@config/firebaseRN';
import AddCardInputFooter from '@components/board/card/AddCardInputFooter';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {screenHeight} from '@utils/Scaling';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};
interface CardListProps {
  taskList: TaskList | FakeTaskList | any;
  showModal: () => void;
  disable: boolean;
}
const ListCard: FC<CardListProps> = ({taskList, showModal, disable}) => {
  const [listTitle, setListTitle] = useState(taskList?.title);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const {filters} = useFilter();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const memoizedTasks = React.useMemo(() => tasks || [], [tasks]);

  const onOpenGallery = async () => {
    await launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 1,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          Toast.show({
            type: 'info',
            text1: 'Image selection cancelled',
            text2: 'You didn’t select any image.',
            position: 'top',
          });
        } else if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Image Picker Error',
            text2:
              response.errorMessage ||
              'Something went wrong while picking the image.',
            position: 'top',
          });
        } else {
          const image = response.assets?.[0];

          if (image?.uri) {
            try {
              setIsUploading(true);
              const imageUrl = await uploadToCloudinary({
                uri: image?.uri,
                type: image?.type,
                fileName: image?.fileName,
              });

              await addCardList(
                taskList?.list_id,
                taskList?.board_id,
                image?.fileName || image?.type || 'Unknown',
                tasks.length,
                imageUrl,
              );
            } catch (error) {
              console.log('Error uploading or saving:', error);
            } finally {
              setIsUploading(false);
            }
          }
        }
      },
    );
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onTaskCardDrop = async (params: DragEndParams<TaskItem>) => {
    const newData = params.data.map((item: any, index: number) => {
      return {...item, position: index + 1};
    });
    setTasks(newData);

    try {
      const updatePromises = newData.map(item => updateCart(item));
      await Promise.all(updatePromises);
    } catch (err) {
      console.log('Error updating card positions:', err);
    }
  };

  const onCardAdd = async () => {
    if (newTask.trim().length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Title is required',
        text2: 'Please enter a title before proceeding.',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }
    setAdding(false);
    await addCardList(
      taskList?.list_id,
      taskList?.board_id,
      newTask.trim(),
      tasks.length,
    );
    setNewTask('');
  };
  useEffect(() => {
    if (!taskList?.list_id) return;

    const unsubscribe = listenToCardsList(
      taskList?.list_id,
      cards => {
        setTasks(cards);
      },
      filters,
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [taskList?.list_id, filters]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.cardContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {isUploading && <CustomModal loading={isUploading} />}
      <View style={styles.card}>
        {/* List Header */}
        <View style={styles.header}>
          <Text style={styles.listTitle}>{listTitle}</Text>
          <TouchableOpacity disabled={disable} onPress={showModal}>
            <Icon
              name="dots-horizontal"
              iconFamily="MaterialCommunityIcons"
              size={22}
              color={Colors.black}
            />
          </TouchableOpacity>
        </View>

        {filters && Object.values(filters).some(val => !!val) && (
          <Text
            style={{
              paddingHorizontal: 8,
              paddingBottom: 4,
              fontSize: RFValue(10),
              color: Colors.fontDark,
            }}>
            {memoizedTasks.length} result{memoizedTasks.length !== 1 ? 's' : ''}{' '}
            found
          </Text>
        )}

        {/* Render Card Tasks */}
        <DraggableFlatList
          data={memoizedTasks}
          renderItem={params => <ListItem {...params} disable={disable} />}
          keyExtractor={item => item.id}
          onDragBegin={() => {
            ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
          }}
          onPlaceholderIndexChange={() => {
            ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
          }}
          onDragEnd={disable ? () => {} : onTaskCardDrop}
          containerStyle={{
            paddingBottom: 4,
            maxHeight: keyboardVisible && adding ? '60%' : '85%',
          }}
          contentContainerStyle={{gap: 4}}
        />

        {adding && (
          <View style={styles.addCardContainer}>
            <AddCardInputFooter
              adding={adding}
              newTask={newTask}
              setNewTask={setNewTask}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setAdding(false);
                  setNewTask('');
                  Keyboard.dismiss();
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={onCardAdd}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!adding && (
          <View style={styles.footerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.addButton}
              onPress={() => {
                if (disable) {
                  Toast.show({
                    type: 'info',
                    text1: 'Access Denied',
                    text2: 'You cannot add a card in a workspace.',
                  });
                  return;
                }
                setAdding(true);
              }}>
              <Icon
                name="plus"
                iconFamily="MaterialCommunityIcons"
                size={16}
                color={Colors.fontDark}
              />
              <Text style={[styles.addButtonText, {color: Colors.fontDark}]}>
                Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={disable}
              activeOpacity={0.8}
              onPress={onOpenGallery}>
              <Icon
                name="image-outline"
                iconFamily="MaterialCommunityIcons"
                size={20}
                color={Colors.black}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
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
  addCardContainer: {
    marginBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.lightprimary,
    fontWeight: 'bold',
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.lightprimary,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
