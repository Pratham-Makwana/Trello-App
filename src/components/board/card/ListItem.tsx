import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {Colors, TaskItem} from '@utils/Constant';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ListItem = ({item, drag, isActive}: RenderItemParams<TaskItem>) => {
  return (
    <>
      <AnimatedTouchable
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.rowItem]}>
        {!item?.imageUrl && (
          <View>
            <Text style={{color: Colors.fontDark}}>{item.title}</Text>
          </View>
        )}
      </AnimatedTouchable>
    </>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  rowItem: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
