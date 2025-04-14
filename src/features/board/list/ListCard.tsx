import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {Colors, FakeTaskList, TaskList} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {addCardList, getListCard} from '@config/firebase';

interface CardListProps {
  taskList: TaskList | FakeTaskList | any;
}
const ListCard: FC<CardListProps> = ({taskList}) => {
  const [listTitle, setListTitle] = useState(taskList?.title);
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    loadCardList();
  }, [taskList?.list_id]);

  const loadCardList = async () => {
    const data = await getListCard(taskList?.list_id);
    setTasks(data);
  };

  const onCardAdd = async () => {
    await addCardList(
      taskList?.list_id,
      taskList?.board_id,
      listTitle,
      tasks.length,
    );
    setAdding(false);
    setNewTask('');
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.listTitle}>{listTitle}</Text>
          <TouchableOpacity>
            <Icon
              name="dots-horizontal"
              iconFamily="MaterialCommunityIcons"
              size={22}
              color={Colors.black}
            />
          </TouchableOpacity>
        </View>

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
  );
};

export default ListCard;

const styles = StyleSheet.create({
  cardContainer: {
    paddingTop: 20,
    paddingHorizontal: 30,
    maxHeight: '88%',
  },

  card: {
    backgroundColor: '#F3EFFC',
    borderRadius: 4,
    padding: 6,
    marginBottom: 16,
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
});
