import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC, useState} from 'react';
import {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from '../global/Icon';
import {Colors, ModalType} from '@utils/Constant';
import CustomText from '../ui/CustomText';
import {navigate} from '@utils/NavigationUtils';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {doc, setDoc} from 'firebase/firestore';
import {userRef} from '@config/firebase';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

const LOGIN_OPTION = [
  {
    type: 'Google',
    icon: require('@assets/images/login/google.png'),
  },
  {
    type: 'apple',
    icon: require('@assets/images/login/apple.png'),
  },
  {
    type: 'microsoft',
    icon: require('@assets/images/login/microsoft.png'),
  },
  {
    type: 'slack',
    icon: require('@assets/images/login/slack.png'),
  },
];

const AuthModal: FC<{
  authType: ModalType | null;
  onPress: () => void;
}> = ({authType, onPress}) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      const userInfo = await GoogleSignin.signIn();

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const user = userCredential.user;

      const fcmToken = await messaging().getToken();

      const userDocRef = firestore().collection('users').doc(user.uid);
      const existingUser = await userDocRef.get();

      const userData = {
        uid: user.uid,
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        notificationToken: fcmToken,
      };

      if (!existingUser.exists) {
        await userDocRef.set(userData);
      } else {
        const existingToken = existingUser.data()?.notificationToken;
        if (existingToken !== fcmToken) {
          await userDocRef.update({notificationToken: fcmToken});
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Toast.show({
          type: 'error',
          text1: 'Sign in was cancelled',
          text2: 'Please try again.',
        });
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Toast.show({
          type: 'error',
          text1: 'Sign in is in progress',
          text2: 'Please wait.',
        });
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: 'error',
          text1: 'Play Services not available',
          text2: 'Please install or update Google Play Services.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'An unexpected error occurred',
          text2: 'Please try again later.',
        });
      }
    }
  };

  const handleSubmit = () => {
    if (authType == ModalType.Login) {
      navigate('LoginScreen');
      onPress();
    } else {
      navigate('SignUpScreen');
      onPress();
    }
  };
  return (
    <BottomSheetView style={styles.modalContainer}>
      <TouchableOpacity style={styles.modalBtn} onPress={handleSubmit}>
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
          activeOpacity={0.8}
          onPress={() => item.type === 'Google' && handleGoogleLogin()}>
          <Image source={item.icon} style={styles.imgBtn} />
          <CustomText
            fontFamily="Montserrat-Medium"
            variant="h6"
            style={styles.btnText}>
            Continue With {item.type}
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
