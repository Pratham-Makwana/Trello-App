import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC, useState} from 'react';
import {Colors} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {screenWidth} from '@utils/Scaling';

interface WorkSpaceVisibilityProps {
  title: string;
  subTitle: string;
  iconName: string;
  iconFamily:
    | 'Ionicons'
    | 'MaterialIcons'
    | 'MaterialCommunityIcons'
    | 'FontAwesome';
  size: number;
}

const WorkSpaceVisibility: FC<WorkSpaceVisibilityProps> = ({
  iconFamily,
  iconName,
  size,
  subTitle,
  title,
}) => {
  const [selected, setSelected] = useState(true);
  return (
    <TouchableOpacity
      style={styles.touchContainer}
      activeOpacity={0.9}
      onPress={() => {}}>
      <View style={styles.iconLeft}>
        <Icon
          name={iconName}
          size={size}
          color={Colors.textgrey}
          iconFamily={iconFamily}
        />
      </View>

      <View style={styles.secondView}>
        <View style={styles.innerFirstView}>
          <Text style={styles.titleText}>{title} </Text>
        </View>
        <View>
          <Text style={styles.subTitle}>{subTitle}</Text>
        </View>
      </View>
      {selected && (
        <View style={styles.selectedIcon}>
          <Icon
            name="check"
            iconFamily="MaterialIcons"
            size={30}
            color={Colors.lightprimary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default WorkSpaceVisibility;

const styles = StyleSheet.create({
  touchContainer: {
    width: '100%',
    height: screenWidth * 0.3,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textgrey,

  },

  iconLeft: {
    width: '10%',
    height: '100%',
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondView: {
    flex: 1,
  },
  innerFirstView: {
    marginBottom: 10,
  },
  selectedIcon: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    color: Colors.black,
  },
  subTitle: {
    color: Colors.textgrey,
  },
});
