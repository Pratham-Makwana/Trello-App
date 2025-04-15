import Logo from '@assets/images/splash.png';
import React, {FC, useEffect, useState} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {Colors} from '@utils/Constant';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from '@config/firebase';
import {useAuthContext} from '@context/UserContext';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {webClientId} from '@env';
import CustomModal from '@components/global/CustomModal';

const SplashScreen: FC = () => {
  // const {user, setUser} = useAuthContext();
  // const [initializing, setInitializing] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, user => {
  //     if (user) {
  //       console.log('==> user', user);

  //       setInitializing(true);
  //       setUser(user);
  //       resetAndNavigate('MainStack');
  //     } else {
  //       resetAndNavigate('AuthStack');
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  // if (initializing)
  //   return (
  //     <View style={{flex: 1}}>
  //       <CustomModal loading={initializing} transparent={false} />
  //     </View>
  //   );

  // useEffect(() => {
  //   const intialStartup = () => {
  //     GoogleSignin.configure({
  //       webClientId: webClientId,
  //     });
  //   };
  //   const timeOut = setTimeout(intialStartup, 2000);
  //   return () => clearTimeout(timeOut);
  // }, []);

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
