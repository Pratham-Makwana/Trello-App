import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {useUser} from '@hooks/useUser';
import auth from '@react-native-firebase/auth';

import {updateUserProfile} from '@config/firebaseRN';
import useKeyboardOffsetHeight from '@utils/useKeyboardOffsetHeight';

const EditUsernameSheet = ({onClose}: {onClose: () => void}) => {
  const {user: currentUser, setUser} = useUser();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [loading, setLoading] = useState(false);
  const keyboardOffset = useKeyboardOffsetHeight();
  const handleSave = async () => {
    if (!username.trim()) return;

    try {
      setLoading(true);
      await updateUserProfile(currentUser!.uid, {username: username.trim()});
      await auth().currentUser?.updateProfile({
        displayName: username.trim(),
      });

      const updatedUser = {
        ...currentUser,
        username: username.trim(),
      };

      setUser(updatedUser);
      onClose();
    } catch (error) {
      console.log('Error updating username:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={[
          sheetStyles.container,
          {paddingBottom: keyboardOffset},
        ]}
        keyboardShouldPersistTaps="handled">
        <Text style={sheetStyles.title}>Edit Username</Text>
        <TextInput
          style={sheetStyles.input}
          placeholder="Enter new username"
          value={username}
          onChangeText={setUsername}
          editable={!loading}
        />
        <View style={sheetStyles.buttonRow}>
          <TouchableOpacity
            style={[sheetStyles.button, sheetStyles.cancelButton]}
            onPress={onClose}
            disabled={loading}>
            <Text style={sheetStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[sheetStyles.button, sheetStyles.saveButton]}
            onPress={handleSave}
            disabled={loading || !username.trim()}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={sheetStyles.buttonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditUsernameSheet;

const sheetStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom : 20
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
