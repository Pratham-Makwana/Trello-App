import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import Icon from './Icon';
import {Colors} from '@utils/Constant';

interface CustomHeaderLeftProps {
  onPress: () => void;
  iconName: string;
  iconSize: number;
  iconColor?: string;
  iconFamily:
    | 'Ionicons'
    | 'MaterialIcons'
    | 'MaterialCommunityIcons'
    | 'FontAwesome';
}
const CustomHeaderLeft: FC<CustomHeaderLeftProps> = ({
  iconFamily,
  iconName,
  iconSize,
  iconColor = Colors.lightprimary,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon
        name={iconName}
        size={iconSize}
        color={iconColor}
        iconFamily={iconFamily}
      />
    </TouchableOpacity>
  );
};

export default CustomHeaderLeft;

const styles = StyleSheet.create({});
