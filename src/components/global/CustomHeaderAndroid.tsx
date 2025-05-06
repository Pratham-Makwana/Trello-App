import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import React, {FC} from 'react';
import {screenWidth} from '@utils/Scaling';
import {Board, Colors} from '@utils/Constant';
import Icon from './Icon';
import {goBack, navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useAppSelector} from '@store/reduxHook';

interface CustomHeaderAndroidProps {
  title: string;
  board?: Board;
  boardId: string;
  showBottomSheet: () => void;
}
const CustomHeaderAndroid: FC<CustomHeaderAndroidProps> = ({
  title,
  board,
  boardId,
  showBottomSheet,
}) => {
  const members = useAppSelector(state => state.member.members);
  const currentBoardOwner = members.find(member => member.role === 'creator');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.icon}>
        <TouchableOpacity activeOpacity={0.8} onPress={goBack}>
          <Icon
            name="arrow-back"
            iconFamily="Ionicons"
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>
            {currentBoardOwner?.username || 'Person'}'s Workspace
          </Text>
        </View>
      </View>
      {/* Icons  */}
      <View style={[styles.rowIconContainer]}>
        <TouchableOpacity activeOpacity={0.8} onPress={showBottomSheet}>
          <Icon
            name="filter-circle-outline"
            iconFamily="Ionicons"
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            navigate(
              'BoardMenu',
              {boardId: boardId},
              // {boardId: board?.boardId}
            );
          }}>
          <Icon
            name="dots-horizontal"
            iconFamily="MaterialCommunityIcons"
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomHeaderAndroid;

const styles = StyleSheet.create({
  blurContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },

  mainContainer: {
    flexDirection: 'row',
    width: screenWidth,
    paddingBottom: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: screenWidth * 0.15,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'grey',
    // justifyContent: 'space-around',
  },
  icon: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    gap: 3,
    justifyContent: 'center',
  },
  rowIconContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  text: {
    fontSize: 12,
    // paddingBottom: 5,
    color: Colors.black,
  },
});
