import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
import {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from '../global/Icon';
import {Colors, ModalType} from '@utils/Constant';
import CustomText from '../ui/CustomText';
import {navigate} from '@utils/NavigationUtils';

const LOGIN_OPTION = [
  {
    type: 'Continue With Google',
    icon: require('@assets/images/login/google.png'),
  },
  {
    type: 'Continue With apple',
    icon: require('@assets/images/login/apple.png'),
  },
  {
    type: 'Continue With microsoft',
    icon: require('@assets/images/login/microsoft.png'),
  },
  {
    type: 'Continue With slack',
    icon: require('@assets/images/login/slack.png'),
  },
];

const AuthModal: FC<{authType: ModalType | null}> = ({authType}) => {
  return (
    <BottomSheetView style={styles.modalContainer}>
      <TouchableOpacity
        style={styles.modalBtn}
        onPress={
          authType == ModalType.Login
            ? () => navigate('LoginScreen')
            : () => navigate('SignUpScreen')
        }>
        <Icon
          name="mail-outline"
          size={20}
          iconFamily="Ionicons"
          color={Colors.black}
        />
        <CustomText
          fontFamily="Montserrat-Medium"
          variant="h6"
          style={styles.btnText}>
          {authType === ModalType.Login ? 'Log in' : 'Sign up'} with Email
        </CustomText>
      </TouchableOpacity>
      {LOGIN_OPTION.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.modalBtn}
          activeOpacity={0.8}>
          <Image source={item.icon} style={styles.imgBtn} />
          <CustomText
            fontFamily="Montserrat-Medium"
            variant="h6"
            style={styles.btnText}>
            {item.type}
          </CustomText>
        </TouchableOpacity>
      ))}
    </BottomSheetView>
  );
};

export default AuthModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'flex-start',
    gap: 20,
  },
  modalBtn: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 1,
  },
  imgBtn: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  btnText: {
    color: '#000000',
  },
});
