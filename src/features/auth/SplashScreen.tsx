import Logo from '@assets/images/splash.png';

import {Image, StatusBar, StyleSheet, View} from 'react-native';
import {screenHeight} from '@utils/Scaling';
import {Colors} from '@utils/Constant';

const SplashScreen = () => {
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
