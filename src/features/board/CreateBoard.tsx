import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Colors} from '@utils/Constant';
import Icon from '@components/global/Icon';
import {goBack, navigate} from '@utils/NavigationUtils';
import {useBoard} from '@context/BoardContext';
import LinearGradient from 'react-native-linear-gradient';
import {screenWidth} from '@utils/Scaling';
import {useUser} from '@hooks/useUser';

const CreateBoard = () => {
  const {user} = useUser();

  const {selectedWorkSpace, selectedColor, boardName, setBoardName} =
    useBoard();

  const gradientColors =
    selectedColor.length === 1
      ? [selectedColor[0], selectedColor[0]]
      : selectedColor;

  return (
    <View style={styles.container}>
      <TextInput
        value={boardName}
        onChangeText={text => setBoardName(text)}
        style={styles.input}
        placeholder="New Board"
        placeholderTextColor={Colors.placeholdertext}
      />

      {/* WorkSpace */}
      <TouchableOpacity
        style={styles.touchContainer}
        activeOpacity={0.9}
        onPress={() => {}}>
        <View style={styles.mainView}>
          <View style={styles.textLeft}>
            <Text style={styles.text}>WorkSpace</Text>
          </View>

          <View style={styles.secondView}>
            <View style={styles.innerFirstView}>
              <Text style={styles.lable}>{user?.username}'s </Text>
              <Text style={styles.lable}>workspace</Text>
            </View>
            <View style={styles.iconView}>
              <Icon
                name="chevron-forward"
                size={22}
                color={Colors.textgrey}
                iconFamily="Ionicons"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {/* Visbility */}
      <TouchableOpacity
        style={[
          styles.touchContainer,
          {borderBottomColor: Colors.textgrey, borderBottomWidth: 1},
        ]}
        activeOpacity={0.9}
        onPress={() => navigate('VisibilitySelect')}>
        <View style={styles.mainView}>
          <View style={styles.textLeft}>
            <Text style={styles.text}>Visibility</Text>
          </View>

          <View style={styles.secondView}>
            <View style={styles.innerFirstView}>
              <Text style={styles.lable}>{selectedWorkSpace}</Text>
            </View>
            <View style={styles.iconView}>
              <Icon
                name="chevron-forward"
                size={22}
                color={Colors.textgrey}
                iconFamily="Ionicons"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {/* Background */}
      <TouchableOpacity
        style={[styles.touchContainer]}
        activeOpacity={0.9}
        onPress={() => navigate('BGSelect')}>
        <View style={styles.mainView}>
          <View style={styles.textLeft}>
            <Text style={styles.text}>Background</Text>
          </View>

          <View style={styles.secondView}>
            <View style={styles.innerFirstView}>
              <LinearGradient
                colors={gradientColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.colorPreview}
              />
            </View>
            <View style={styles.iconView}>
              <Icon
                name="chevron-forward"
                size={22}
                color={Colors.textgrey}
                iconFamily="Ionicons"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default CreateBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 20,
    backgroundColor: Colors.grey,
  },
  input: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.textgrey,
    backgroundColor: Colors.white,
    color: Colors.black,

    padding: 12,
    paddingHorizontal: 24,
    fontSize: 16,
    marginBottom: 32,
  },
  touchContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomColor: Colors.textgrey,
    borderBottomWidth: 1,
  },
  mainView: {
    flexDirection: 'row',
    width: screenWidth,
  },
  textLeft: {
    paddingHorizontal: 15,
    width: screenWidth * 0.3,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 5,
  },
  secondView: {
    width: screenWidth * 0.7,
    flexDirection: 'row',
    padding: 5,
  },
  innerFirstView: {
    alignItems: 'flex-end',
    width: screenWidth * 0.6,
    padding: 5,
  },
  iconView: {
    // backgroundColor : 'red',
    // width: screenWidth * 0.1,
    // paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  text: {
    flexWrap: 'wrap',
    fontSize: 14,
    color: Colors.black,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 5,
  },
  lable: {
    color: Colors.textgrey,
  },
});
