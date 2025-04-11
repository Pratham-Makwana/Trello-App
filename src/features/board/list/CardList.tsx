import {StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {FakeTaskList, TaskList} from '@utils/Constant';

interface CardListProps {
  taskList: TaskList | FakeTaskList;
}
const CardList: FC<CardListProps> = ({taskList}) => {
  return (
    <View>
      <Text>CardList</Text>
    </View>
  );
};

export default CardList;

const styles = StyleSheet.create({});
