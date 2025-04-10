import {Button, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SignOut} from '@config/firebase';
import {useAuthContext} from '@context/UserContext';
import {resetAndNavigate} from '@utils/NavigationUtils';

const Profile = () => {
  const {setUser} = useAuthContext();
  const handleLogout = async () => {
    try {
      await SignOut();
      setUser(null);

      console.log('User logged out successfully');
      resetAndNavigate('AuthStack', {screen: 'OnBoarding'});
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <View>
      <Text>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
