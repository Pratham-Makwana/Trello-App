import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';
import Toast from 'react-native-toast-message';
import auth from '@react-native-firebase/auth';
import {checkUserExists} from '@config/firebaseRN';
import {validateEmail} from '@utils/validation';
import {goBack, navigate} from '@utils/NavigationUtils';
import {screenWidth} from '@utils/Scaling';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('user@gmail.com');
  const [emailError, setEmailError] = useState<string>('');
  const keyBoardOffsetHeight = useKeyboardOffsetHeight();

  const handleSubmit = async () => {
    setEmailError('');
    if (!email) {
      setEmailError('Please enter email address.');
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your email address.',
      });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    const userExist = await checkUserExists(email);

    if (!userExist) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email address not found.',
      });
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset email sent.',
      });
      setEmailError('');
      setEmail('');
      setTimeout(() => {
        goBack();
      }, 500);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send password reset email.',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: keyBoardOffsetHeight},
          ]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@assets/images/logo.png')}
              style={{width: '90%', height: '90%', borderRadius: 50}}
              resizeMode="contain"
            />
          </View>
          <View style={styles.innerContainer}>
            <Text style={styles.header}>Forgot Password?</Text>
            <Text style={styles.subHeader}>
              Enter your email to receive reset instructions
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
            />
            {emailError ? (
              <Text style={{color: 'red', marginBottom: 20}}>{emailError}</Text>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1465de',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 300,
    height: 75,
    marginBottom: 10,
  },
  innerContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1465de',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1465de',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  linkContainer: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#1465de',
  },
});

export default ForgotPasswordScreen;
