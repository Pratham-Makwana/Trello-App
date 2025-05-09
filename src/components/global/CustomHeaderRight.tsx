import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
import {screenWidth} from '@utils/Scaling';
import {Colors} from '@utils/Constant';
import {useBoard} from '@context/BoardContext';

interface CustomHeaderRightProps {
  onPress: () => void;
  title: string;
  isLoading : boolean
}

const CustomHeaderRight: FC<CustomHeaderRightProps> = ({onPress, title, isLoading}) => {  
  const {boardName} = useBoard();
  return (
    <View style={styles.btnContainer}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={boardName === '' || isLoading}
        onPress={onPress}>
        <Text
          style={boardName === '' ? styles.btnTextDisabled : styles.btnText}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeaderRight;

const styles = StyleSheet.create({
  btnContainer: {
    width: screenWidth * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnTextDisabled: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textgrey,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.lightprimary,
  },
});
