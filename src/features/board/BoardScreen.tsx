import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {DarkColors} from '@utils/Constant';
import { DefaultTheme } from '@react-navigation/native';

const BoardScreen = () => {
  return (
    <View>
      <StatusBar backgroundColor={DefaultTheme.colors.text} />
      <Text>BoardScreen</Text>
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({});
