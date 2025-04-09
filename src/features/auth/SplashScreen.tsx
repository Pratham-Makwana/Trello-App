import Logo from '@assets/images/splash.png';
import React, {FC, useEffect} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {Colors} from '@utils/Constant';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '@config/firebase';
import {useAuthContext} from '@context/UserContext';
// import {authStorage} from '@state/storage';

const SplashScreen: FC = () => {
  const {setUser, user} = useAuthContext();
  console.log('==> SplashScreen:user: ', user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // const serializedUser = {
        //   uid: user.uid,
        //   email: user.email,
        //   displayName: user.displayName,
        //   photoURL: user.photoURL,
        // };
        setUser(user);
        // authStorage.set('authUser', JSON.stringify(user));

        resetAndNavigate('MainStack', {screen: 'board'});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const intialStartup = () => {
      if (user) {
        console.log('==> MainStack Screen Board Screen');
        resetAndNavigate('MainStack', {screen: 'board'});
        return;
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
