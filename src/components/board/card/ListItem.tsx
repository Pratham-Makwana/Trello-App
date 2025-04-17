import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {RenderItemParams} from 'react-native-draggable-flatlist';
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

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{flex: 1, color: Colors.black}}>{item.title}</Text>
              {/* {item.assigned_to && (
                <Ionicons
                  name="person-circle-outline"
                  size={16}
                  color={'#000'}
                />
              )} */}
            </View>
          </>
        )}

        {!item?.imageUrl && (
          <View>
            <Text style={{color: Colors.fontDark}}>{item.title}</Text>
          </View>
        )}
      </AnimatedTouchable>
    </>
  );
};

export default  ListItem;

const styles = StyleSheet.create({
  rowItem: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
