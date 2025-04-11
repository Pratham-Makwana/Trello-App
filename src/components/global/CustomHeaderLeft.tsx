import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import React, {FC} from 'react';
import Icon from './Icon';
import {Colors} from '@utils/Constant';

interface CustomHeaderLeftProps {
  btnStyle?: ViewStyle;
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
  btnStyle,
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
