import Logo from '@assets/images/splash.png';
import React, {FC, useEffect} from 'react';
import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {navigate} from '@utils/NavigationUtils';
import {Colors} from '@utils/Constant';

const SplashScreen: FC = () => {



  useEffect(() => {
    const intialStartup = () => {
      navigate('LoginScreen');
    };
    const timeOut = setTimeout(intialStartup, 2000);
    return () => clearTimeout(timeOut);
  }, []);
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
