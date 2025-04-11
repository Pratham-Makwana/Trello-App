import Logo from '@assets/images/splash.png';
import React, {FC, useEffect} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {Colors} from '@utils/Constant';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '@config/firebase';
import {useAuthContext} from '@context/UserContext';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {webClientId} from '@env';

const SplashScreen: FC = () => {
  const {user} = useAuthContext();

  useEffect(() => {
    const intialStartup = () => {
      GoogleSignin.configure({
        webClientId: webClientId,
      });
      if (user) {
        console.log('==> User Exists');
        resetAndNavigate('MainStack', {screen: 'board'});
      } else {
        console.log('==> OnBoarding Screen');
        navigate('OnBoarding');
      }
    };
    const timeOut = setTimeout(intialStartup, 2000);
    return () => clearTimeout(timeOut);
  }, [user]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.lightprimary} />
      <Image source={Logo} style={styles.logoImage} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightprimary,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    height: screenHeight,
    resizeMode: 'contain',
  },
});
