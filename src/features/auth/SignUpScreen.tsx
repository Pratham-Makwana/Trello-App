import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import {Colors, Fonts} from '@utils/Constant';
import CustomButton from '@components/ui/CustomButton';
import {navigate} from '@utils/NavigationUtils';
import {RFValue} from 'react-native-responsive-fontsize';
import FormField from '@components/ui/FormField';
import CustomText from '@components/ui/CustomText';

import Toast from 'react-native-toast-message';
import {firebaseAuthErrorMessage} from '@utils/exceptions/firebaseErrorHandler';
import {createUser} from '@config/firebaseRN';
import {validateEmail, validatePassword} from '@utils/validation';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';

const SignupScreen = () => {
  // const [form, setForm] = useState({
  //   username: 'user',
  //   email: 'user@gmail.com',
  //   password: 'Test1234',
  // });

  const [form, setForm] = useState({
    username: 'user',
    email: 'user@gmail.com',
    password: 'Test@1234',
  });
  const keyBoardOffsetHeight = useKeyboardOffsetHeight();

  const [isSubmitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');

  const handleSignup = async () => {
    setEmailError('');
    setPasswordError('');
    setUsernameError('');
    if (form.username.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
    } else {
      setUsernameError('');
    }
    if (form.username.length > 20) {
      setUsernameError('Username must be at most 20 characters long.');
    }

    if (!validateEmail(form.email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setPasswordError(passwordError);
    } else {
      setPasswordError('');
    }

    try {
      if (validateEmail(form.email) && !passwordError && !usernameError) {
        setSubmitting(true);
        await createUser(form.username, form.email, form.password);
        setSubmitting(false);
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
              SignUp in to Trello
            </CustomText>
            <FormField
              title="Username"
              value={form.username}
              placeholder="Enter your username"
              handleChangeText={(e: string) => setForm({...form, username: e})}
              otherStyles={{marginTop: 28}}
              keyboardType="default"
            />
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
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
            <CustomButton
              title="Sign Up"
              handlePress={handleSignup}
              isLoading={isSubmitting}
              contentContainerStyle={{width: screenWidth * 0.9, marginTop: 28}}
            />
            <View style={styles.footerContainer}>
              <Text style={styles.footerTitle}>Already have account? </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigate('LoginScreen')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightprimary,
    // height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  mainContainer: {
    height: screenHeight * 0.8,
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
    fontFamily: Fonts.Light,
    fontWeight: '500',
  },
  footerLink: {
    color: Colors.white,
    fontSize: RFValue(16),
    fontFamily: Fonts.Regular,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.white,
    fontWeight: '600',
  },
  errorText: {
    color: '#8B0000',
    fontSize: RFValue(12),

    fontWeight: '500',
    paddingHorizontal: 5,
    marginTop: 6,
  },
});
