import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import {useUser} from '@hooks/useUser';
import auth from '@react-native-firebase/auth';

import {updateUserProfile} from '@config/firebaseRN';
import Icon from '@components/global/Icon';

const EditUsernameSheet = ({onClose}: {onClose: () => void}) => {
  const {user: currentUser, setUser} = useUser();
  const [username, setUsername] = useState(currentUser?.username || '');
  const [loading, setLoading] = useState(false);
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
    <ScrollView
      contentContainerStyle={[styles.container]}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Edit Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new username"
        value={username}
        onChangeText={setUsername}
        editable={!loading}
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
          disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.saveButton,
            (!username.trim() || loading) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={loading || !username.trim()}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Icon name="check" size={16} color="#fff" iconFamily="Feather" />
              <Text style={styles.saveButtonText}>Save</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditUsernameSheet;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
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
    marginBottom: 20,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 15,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#007bff',
    opacity: 0.5,
  },
});
