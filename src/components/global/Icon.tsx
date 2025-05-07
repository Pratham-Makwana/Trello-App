import {StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

interface IconProps {
  color?: string;
  size: number;
  name: string;
  iconFamily:
    | 'Ionicons'
    | 'MaterialIcons'
    | 'MaterialCommunityIcons'
    | 'FontAwesome'
    | 'Feather';
}

const Icon: FC<IconProps> = ({name, size, color, iconFamily}) => {
  return (
    <>
      {iconFamily === 'Ionicons' && (
        <Ionicons name={name} size={size} color={color} />
      )}
      {iconFamily === 'MaterialIcons' && (
        <MaterialIcons name={name} size={size} color={color} />
      )}

      {iconFamily === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons name={name} size={size} color={color} />
      )}
      {iconFamily === 'FontAwesome' && (
        <FontAwesome name={name} size={size} color={color} />
      )}
      {iconFamily === 'Feather' && (
        <Feather name={name} size={size} color={color} />
      )}
    </>
  );
};

export default Icon;

const styles = StyleSheet.create({});
