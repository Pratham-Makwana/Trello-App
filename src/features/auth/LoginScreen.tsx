import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {screenHeight, screenWidth} from '@utils/Scaling';
import CustomText from '@components/ui/CustomText';
import FormField from '@components/ui/FormField';
import {Colors, Fonts} from '@utils/Constant';
import CustomButton from '@components/ui/CustomButton';
import {RFValue} from 'react-native-responsive-fontsize';
import {navigate} from '@utils/NavigationUtils';
import {LoginUser} from '@config/firebase';

const LoginScreen = () => {
  const [form, setForm] = useState({
    email: 'test@gmail.com',
    password: '12345678',
  });
  const [isSubmitting, setSubmitting] = useState(false);

  const handleLogin = () => {
    if (form.email && form.password) {
      try {
        setSubmitting(true);
        LoginUser(form.email, form.password);

        setSubmitting(false);
      } catch (e) {
        console.log('==> LoginScreen:handleLogin: ', e);
      } finally {
        setSubmitting(false);
      }
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
          <FormField
            title="Password"
            value={form.password}
            placeholder="Enter your password"
            handleChangeText={(e: string) => setForm({...form, password: e})}
            otherStyles={{marginTop: 28}}
          />
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
    </SafeAreaView>
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
});
