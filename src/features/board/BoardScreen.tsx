import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {DarkColors} from '@utils/Constant';
import { DefaultTheme } from '@react-navigation/native';
import { auth } from '@config/firebase';

const BoardScreen =  () => {
  const loginUser = auth;
  console.log("==> BoardScreen:loginUser: ", loginUser);

  return (
    <View>
      <StatusBar backgroundColor={DefaultTheme.colors.text} />
      <Text>BoardScreen</Text>
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({});
