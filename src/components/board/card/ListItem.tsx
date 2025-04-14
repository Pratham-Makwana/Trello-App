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
  const animatedStyle = useAnimatedStyle(() => {
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 1,
        height: 1,
      },
      shadowOpacity: isActive ? 0.3 : 0,
      shadowRadius: isActive ? 10 : 0,
      elevation: isActive ? 10 : 0,
      transform: [
        {
          translateX: withTiming(isActive ? 10 : 5),
        },
        {
          rotateX: withTiming(isActive ? '20deg' : '0deg'),
        },
        {
          rotateY: withTiming(isActive ? '-50deg' : '0deg'),
        },
        {
          scale: withTiming(isActive ? 1.04 : 1),
        },
      ],
    };
  }, [isActive]);
  return (
    <AnimatedTouchable
      activeOpacity={1}
      onLongPress={drag}
      disabled={isActive}
      style={[styles.rowItem, animatedStyle]}>
      {!item?.imageUrl && (
        <View>
          <Text style={{color: Colors.fontDark}}>{item.title}</Text>
        </View>
      )}
    </AnimatedTouchable>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  rowItem: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxWidth: '95%',
  },
});
