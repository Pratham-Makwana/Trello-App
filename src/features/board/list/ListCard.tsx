import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {FC, useEffect, useMemo, useState} from 'react';
import {Colors, FakeTaskList, TaskItem, TaskList} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {
  addCardList,
  listenToCardsList,
  listenToListInfo,
  updateCart,
  uploadToCloudinary,
} from '@config/firebase';
import DraggableFlatList, {
  DragEndParams,
} from 'react-native-draggable-flatlist';
import ListItem from '@components/board/card/ListItem';
import {DefaultTheme} from '@react-navigation/native';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {setCardList} from '@store/card/cardSlice';

interface CardListProps {
  taskList: TaskList | FakeTaskList | any;
  showModal: () => void;
}
const ListCard: FC<CardListProps> = ({taskList, showModal}) => {
  const [listTitle, setListTitle] = useState(taskList?.title);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const memoizedTasks = useMemo(() => tasks, [tasks]);

  useEffect(() => {
    if (!taskList?.list_id) return;

    const unsubscribe = listenToCardsList(taskList?.list_id, cards => {
      console.log('==> cards', cards);
      setTasks(cards);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribeListTitle = listenToListInfo(
      taskList.list_id,
      updatedList => {
        setListTitle(updatedList.title);
      },
    );

    return () => {
      if (unsubscribeListTitle) unsubscribeListTitle();
    };
  }, []);

  const onTaskCardDrop = async (params: DragEndParams<TaskItem>) => {
    const newData = params.data.map((item: any, index: number) => {
      return {...item, position: index};
    });
    setTasks(newData);
    // newData.map(async item => {
    //   await updateCart(item);
    // });
    try {
      const updatePromises = newData.map(item => updateCart(item));
      await Promise.all(updatePromises);
    } catch (err) {
      console.log('Error updating card positions:', err);
    }
  };

  const onCardAdd = async () => {
    setAdding(false);
    await addCardList(
      taskList?.list_id,
      taskList?.board_id,
      newTask,
      tasks.length,
    );
    setNewTask('');
  };

  const onOpenGallery = async () => {
    await launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 1,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const image = response.assets?.[0];

          if (image?.uri) {
            try {
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
            }
          }
        }
      },
    );
  };

  return (
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
            data={memoizedTasks}
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
              <TouchableOpacity activeOpacity={0.8} onPress={onOpenGallery}>
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
