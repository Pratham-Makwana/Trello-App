import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import CustomText from '@components/ui/CustomText';
import FormField from '@components/ui/FormField';
import {Colors, Fonts} from '@utils/Constant';
import CustomButton from '@components/ui/CustomButton';
import {RFValue} from 'react-native-responsive-fontsize';
import {navigate} from '@utils/NavigationUtils';
import Toast from 'react-native-toast-message';
import {firebaseAuthErrorMessage} from '@utils/exceptions/firebaseErrorHandler';
import {loginUser} from '@config/firebaseRN';
import {validateEmail} from '@utils/validation';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: 'makwanapratham13@gmail.com',
    password: 'User@123',
  });
  const [isSubmitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const keyBoardOffsetHeight = useKeyboardOffsetHeight();

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
    if (!form.password) {
      setPasswordError('Please enter your password.');
    }

    try {
      if (validateEmail(form.email) && !passwordError) {
        setSubmitting(true);
        await loginUser(form.email, form.password);
      }
    } catch (error: any) {
      const message = firebaseAuthErrorMessage(error.code);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: message,
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: keyBoardOffsetHeight},
          ]}>
          <View style={styles.mainContainer}>
            <Image
              source={require('@assets/images/logo.png')}
              style={styles.img}
              resizeMode="contain"
            />
            <CustomText
              variant="h1"
              fontFamily="Montserrat-Medium"
              style={styles.headerTitle}>
              LogIn in to Trello
            </CustomText>
            <FormField
              title="Email"
              value={form.email}
              placeholder="Enter your email"
              handleChangeText={(e: string) => setForm({...form, email: e})}
              otherStyles={{marginTop: 28}}
              keyboardType="email-address"
            />
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
            <FormField
              title="Password"
              value={form.password}
              placeholder="Enter your password"
              handleChangeText={(e: string) => setForm({...form, password: e})}
              otherStyles={{marginTop: 28}}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.forgotPassword}
              activeOpacity={0.9}
              onPress={() => navigate('ForgotPasswordScreen')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton
              title="Log In"
              handlePress={handleLogin}
              isLoading={isSubmitting}
              contentContainerStyle={{width: screenWidth * 0.9, marginTop: 28}}
            />
            <View style={styles.footerContainer}>
              <Text style={styles.footerTitle}>Don't have account? </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigate('SignUpScreen')}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Toast />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightprimary,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  mainContainer: {
    height: screenHeight * 0.75,
    width: screenWidth,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  img: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.2,
    borderRadius: 20,
  },
  headerTitle: {
    marginTop: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    rowGap: 8,
  },
  footerTitle: {
    color: Colors.white,
    fontSize: RFValue(14),
    fontFamily: Fonts.Regular,
    fontWeight: '500',
  },
  footerLink: {
    color: Colors.white,
    fontSize: RFValue(16),
    fontFamily: Fonts.Medium,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.white,
    fontWeight: '600',
  },
  errorText: {
    color: '#8B0000',
    fontSize: RFValue(12),
    fontFamily: Fonts.SemiBold,
    marginTop: 4,
  },
  forgotPassword: {
    width: screenWidth * 0.9,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotPasswordText: {
    color: Colors.white,
    fontSize: RFValue(14),
    fontFamily: Fonts.Regular,
    fontWeight: '500',
    marginTop: 16,
  },
});
