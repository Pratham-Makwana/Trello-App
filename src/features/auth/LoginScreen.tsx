import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useMemo, useRef, useState} from 'react';
import TrelloLightLogin from '@assets/images/login/trello.png';
import TrelloDarkLogin from '@assets/images/login/image.png';
import {screenHeight} from '@utils/Scaling';
import {Colors, ModalType, useGlobalColorScheme} from '@utils/Constant';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

import CustomeText from '@components/ui/CustomText';

import AuthModal from '@components/auth/AuthModal';
import { navigate } from '@utils/NavigationUtils';

const LoginScreen = () => {
  const {top} = useSafeAreaInsets();
  const isDark = useGlobalColorScheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  bottomSheetModalRef.current?.present();
  const snapPoints = useMemo(() => ['33%'], []);
  const [authType, setAuthType] = useState<ModalType | null>(null);

  const paddingStyle: ViewStyle = {
    backgroundColor: isDark ? Colors.darkprimary : Colors.lightprimary,
    paddingTop: Platform.OS === 'ios' ? top + 30 : 30,
  };
  const openLink = () => {};
  const openActionSheet = () => {};

  const showModal = (type: ModalType) => {
    setAuthType(type);
    bottomSheetModalRef.current?.present();
  };

  return (
    <BottomSheetModalProvider>
      <View style={[styles.container, paddingStyle]}>
        <StatusBar
          backgroundColor={isDark ? Colors.darkprimary : Colors.lightprimary}
        />
        <Image
          source={isDark ? TrelloDarkLogin : TrelloLightLogin}
          style={styles.image}
        />
        <CustomeText
          fontSize={13}
          fontFamily="Montserrat-Regular"
          style={styles.introText}>
          Move teamwork forward - even on the go
        </CustomeText>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
          onLongPress={() => navigate('UserBottomTab')}
            onPress={() => showModal(ModalType.Login)}
            activeOpacity={0.9}
            style={[styles.btn, {backgroundColor: Colors.white}]}>
            <CustomeText variant="h5" color={Colors.lightprimary}>
              Log in
            </CustomeText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showModal(ModalType.SignUp)}
            activeOpacity={0.9}
            style={[
              styles.btn,
              {borderColor: isDark ? '#000000' : Colors.white},
            ]}>
            <CustomeText variant="h5">Sign Up</CustomeText>
          </TouchableOpacity>
          <Text style={styles.description}>
            By signing up, you agree to the{' '}
            <Text style={styles.link} onPress={openLink}>
              User Notice
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={openLink}>
              Privacy Policy
            </Text>
            .
          </Text>
          <Text style={styles.link} onPress={openActionSheet}>
            Can't log in our sign up?
          </Text>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        // backdropComponent={}
        enableOverDrag={false}
        enablePanDownToClose>
        <AuthModal authType={authType} />
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    height: screenHeight * 0.5,
    resizeMode: 'contain',
  },
  introText: {
    fontWeight: '600',
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  bottomContainer: {
    width: '100%',
    gap: 10,
    paddingHorizontal: 40,
  },

  btn: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: '#fff',
    marginHorizontal: Platform.OS == 'android' ? 70 : 60,
  },
  link: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
