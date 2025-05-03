import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
import Icon from '@components/global/Icon';

interface CustomCloseButtonProps {
  onClose: () => void;
}

const CustomCloseButton: FC<CustomCloseButtonProps> = ({onClose}) => {
  return (
    <View
      style={{
        paddingTop: 10,
        alignItems: 'center',
      }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onClose}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#B4B4B4',
          borderRadius: 50,
          padding: 5,
        }}>
        <Icon name="close" iconFamily="Ionicons" size={22} />
      </TouchableOpacity>
    </View>
  );
};

export default CustomCloseButton;

const styles = StyleSheet.create({});
