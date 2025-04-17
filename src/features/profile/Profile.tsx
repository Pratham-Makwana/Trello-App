import {Button, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SignOut} from '@config/firebase';
import {useUser} from '@hooks/useUser';

const Profile = () => {
  const {logout} = useUser();
  const handleLogout = async () => {
    try {
      await SignOut();
      logout();

      console.log('User logged out successfully');
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
