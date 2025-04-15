import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {FC, useEffect, useRef, useState} from 'react';
import {Board, FakeTaskList, TaskItem, TaskList} from '@utils/Constant';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';
import {screenHeight, screenWidth} from '@utils/Scaling';
import ListTitleInput from '../list/ListTitleInput';
import {useSharedValue} from 'react-native-reanimated';
import {addBoardList, getBoardLists} from '@config/firebase';
import CustomText from '@components/ui/CustomText';
import ListCard from '../list/ListCard';

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

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };
  const onSaveList = async (title: string | any) => {
    setActive(false);
    const newList = await addBoardList(board?.boardId, title);
    taskList.pop();

    newList && setTaskList([...taskList, newList, {list_id: undefined}]);
  };

  useEffect(() => {
    loadBoardLists();
  }, []);

  const loadBoardLists = async () => {
    if (!board) return;
    const lists = await getBoardLists(board?.boardId);

    setTaskList([...lists, {id: undefined}]);
  };

  const onDeleteBoardList = (id: string | undefined) => {
    setTaskList(taskList.filter(item => item.list_id != id));
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom']}>
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
                  taskList={item}
                  onDeleteBoardList={() => onDeleteBoardList(item?.list_id)}
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
});
