import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
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
  onPress: (type: ModalType) => void;
}> = ({authType, onPress}) => {
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      const userInfo = await GoogleSignin.signIn();
      console.log('userinfo', userInfo);

      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      console.log('googleCredential: ', googleCredential);

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      const user = userCredential.user;

      console.log('User signed in successfully:', user);

      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      // Prepare user data for Firestore
      const userData = {
        uid: user.uid,
        username: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        notificationToken: fcmToken,
      };
      console.log('userData', userData);

      // Store user data in Firestore
      await setDoc(doc(userRef, user.uid), userData);
      console.log('User data stored in Firestore successfully.');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services not available');
      } else {
        console.log('An unexpected error occurred:', error);
      }
    }
  };
  return (
    <BottomSheetView style={styles.modalContainer}>
      <TouchableOpacity
        style={styles.modalBtn}
        onPress={() => {
          if (authType) onPress(authType);
        }}>
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
