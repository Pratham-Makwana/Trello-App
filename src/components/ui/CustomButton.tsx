import {TouchableOpacity, StyleSheet, ViewStyle, TextStyle} from 'react-native';
import React, {FC} from 'react';
import CustomText from './CustomText';
import {Colors} from '@utils/Constant';
import CustomModal from '@components/global/CustomModal';

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
        <CustomModal loading={isLoading} />
      ) : (
        <CustomText
          variant="h3"
          fontFamily="Montserrat-Medium"
          style={[styles.btnText, textStyles || {}]}>
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: Colors.lightprimary,
    fontWeight: '600',
  },
});
