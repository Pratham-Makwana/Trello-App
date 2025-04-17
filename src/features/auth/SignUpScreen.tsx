import {
  Image,
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
import {createUser} from '@config/firebase';
import {validateForm} from '@utils/validation';

const SignupScreen = () => {
  const [form, setForm] = useState({
    username: 'user',
    email: 'user@gmail.com',
    password: 'Test1234',
  });

  const [isSubmitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    usernameError: '',
    emailError: '',
    passwordError: '',
  });

  const handleSignup = async () => {
    const validationErrors = validateForm(form, true);

    if (Object.values(validationErrors).some(error => error !== '')) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      await createUser(form.username, form.email, form.password);
      setSubmitting(false);
    } catch (e) {
      console.log('==> SignupScreen:handleSignup: ', e);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
          {errors.usernameError && (
            <Text style={styles.errorText}>{errors.usernameError}</Text>
          )}
          <FormField
            title="Email"
            value={form.email}
            placeholder="Enter your email"
            handleChangeText={(e: string) => setForm({...form, email: e})}
            otherStyles={{marginTop: 28}}
            keyboardType="email-address"
          />
          {errors.emailError && (
            <Text style={styles.errorText}>{errors.emailError}</Text>
          )}
          <FormField
            title="Password"
            value={form.password}
            placeholder="Enter your password"
            handleChangeText={(e: string) => setForm({...form, password: e})}
            otherStyles={{marginTop: 28}}
          />
          {errors.passwordError && (
            <Text style={styles.errorText}>{errors.passwordError}</Text>
          )}
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
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightprimary,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
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
