import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {screenWidth} from '@utils/Scaling';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '@utils/Constant';
import {navigate} from '@utils/NavigationUtils';
import {useBoard} from '@context/BoardContext';

type RootStackParamList = {
  CreateBoard: {bg?: string[]};
  BGSelect: {bg?: string[]};
};

const COLORS = [
  ['#4158D0', '#C850C0', '#FFCC70'],
  ['#0093E9', '#80D0C7'],
  ['#F4D03F', '#16A085'],
  ['#D29034'],
  ['#0079BF'],
  ['#B04632'],
  ['#519839'],
  ['#CD5A91'],
  ['#89609E'],
  ['#00AECC'],
  ['#4BBF6B'],
  ['#838C91'],
];

export const DEFAULT_COLOR = COLORS[0];

const BGSelect = () => {
  const {selectedColor, setSelectedColor} = useBoard();
  //   const [selectedColor, setSelectedColor] = useState<string[]>(DEFAULT_COLOR);

  const changeColor = (color: string[]) => {
    setSelectedColor(color);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {COLORS.map((color, index) => {
        const gradientColors =
          color.length === 1 ? [color[0], color[0]] : color;

        return (
          <TouchableOpacity
            activeOpacity={0.8}
            key={index}
            style={[
              styles.btnContainer,
              {borderWidth: selectedColor === color ? 2 : 0},
            ]}
            onPress={() => changeColor(color)}>
            <LinearGradient
              colors={gradientColors}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.linearColor}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 10,
    paddingBottom: 50,
  },
  btnContainer: {
    height: screenWidth * 0.3,
    width: screenWidth * 0.45,
    margin: 8,
    borderRadius: 6,
    borderColor: Colors.darkprimary,
  },
  linearColor: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
  },
});

export default BGSelect;
