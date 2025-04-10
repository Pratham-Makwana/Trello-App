import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import React, {FC} from 'react';
import CustomText from './CustomText';
import {Colors} from '@utils/Constant';

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  contentContainerStyle?: ViewStyle;
  textStyles?: TextStyle;
  isLoading?: boolean;
}

const CustomButton: FC<CustomButtonProps> = ({
  title,
  handlePress,
  contentContainerStyle,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[contentContainerStyle, styles.btn]}
      disabled={isLoading}>
      {isLoading ? (
        <ActivityIndicator
          size={'small'}
          color={Colors.lightprimary}
          style={{justifyContent: 'center', alignItems: 'center'}}
        />
      ) : (
        <CustomText
          variant="h3"
          fontFamily="Montserrat-Regular"
          style={[textStyles || styles.btnText]}>
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    minHeight: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: Colors.lightprimary,
  },
});
