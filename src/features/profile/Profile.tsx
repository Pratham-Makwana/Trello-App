import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useUser} from '@hooks/useUser';
import // auth,
// updateUserProfile,
//  uploadToCloudinary
'@config/firebase';
import auth from '@react-native-firebase/auth';
import Icon from '@components/global/Icon';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {runOnJS} from 'react-native-reanimated';
import {DefaultTheme} from '@react-navigation/native';
import EditUsernameSheet from '@components/profile/EditUsernameSheet';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {updateProfile} from 'firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  signOut,
  updateUserProfile,
  uploadToCloudinary,
} from '@config/firebaseRN';
import {Colors} from '@utils/Constant';
import {RFValue} from 'react-native-responsive-fontsize';
const Profile = () => {
  const {user: currentUser, logout, setUser} = useUser();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [isUploading, setIsUploading] = useState(false);

  const handleCloseAccount = async () => {
    try {
      const googleUser = await GoogleSignin.getCurrentUser();
      if (googleUser) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await signOut();
      logout();
    } catch (error) {
      console.log('Error closing account:', error);
    }
  };
  const onCancleModal = () => {
    runOnJS(() => {
      bottomSheetRef.current?.close();
    })();
  };
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
        onPress={onCancleModal}
      />
    ),
    [],
  );

  const onOpenGallery = async () => {
    await launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 1,
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel) {
          Toast.show({
            type: 'info',
            text1: 'Image Selection Cancelled ❌',
            text2: 'You didn’t choose an image. Try again if needed.',
          });
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          const image = response.assets?.[0];

          if (image?.uri) {
            try {
              setIsUploading(true);
              const imageUrl = await uploadToCloudinary({
                uri: image?.uri,
                type: image?.type,
                fileName: image?.fileName,
              });

              await updateUserProfile(currentUser!.uid, {photoURL: imageUrl});

              // await updateProfile(auth.currentUser!, {
              //   photoURL: imageUrl,
              // });
              await auth().currentUser?.updateProfile({
                photoURL: imageUrl,
              });
              const updatedUser = {
                ...currentUser,
                photoURL: imageUrl,
              };
              setUser(updatedUser);

              Toast.show({
                type: 'success',
                text1: 'Image Uploaded Successfully ✅',
                text2: 'Your profile picture has been updated.',
              });
            } catch (error) {
              console.log('Error uploading or saving:', error);
            } finally {
              setIsUploading(false);
            }
          }
        }
      },
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageSection}>
        {isUploading ? (
          <View style={[styles.profileImage, styles.loadingContainer]}>
            <ActivityIndicator size="small" color="#007bff" />
          </View>
        ) : (
          <Image
            source={{uri: currentUser?.photoURL || ''}}
            style={styles.profileImage}
          />
        )}
        <TouchableOpacity onPress={onOpenGallery}>
          <Text style={styles.changePictureText}>Change Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <ProfileItem
          label="Username"
          value={currentUser?.username || '—'}
          showModal={() => bottomSheetRef?.current?.present()}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <ProfileItem label="User ID" value={currentUser?.uid || '—'} />
        <ProfileItem label="E-mail" value={currentUser?.email || '—'} />
      </View>

      <TouchableOpacity
        style={styles.closeAccountButton}
        onPress={handleCloseAccount}>
        <Icon
          name="log-out-outline"
          iconFamily="Ionicons"
          size={22}
          color={Colors.black}
        />
        <Text style={styles.closeAccountText}>Log out</Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        handleComponent={null}
        backdropComponent={renderBackdrop}
        handleStyle={{
          backgroundColor: DefaultTheme.colors.background,
          borderRadius: 12,
        }}
        enablePanDownToClose>
        <BottomSheetView>
          <EditUsernameSheet onClose={() => bottomSheetRef.current?.close()} />
        </BottomSheetView>
      </BottomSheetModal>
    </ScrollView>
  );
};

const ProfileItem = ({
  label,
  value,
  showModal,
}: {
  label: string;
  value: string;
  showModal?: () => void;
}) => (
  <View style={styles.itemRow}>
    <Text style={styles.itemLabel}>{label}</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
      <Text style={styles.itemValue}>{value || '—'}</Text>
      {label === 'Username' && (
        <TouchableOpacity onPress={showModal}>
          <Icon
            name="edit"
            size={20}
            color="#007bff"
            iconFamily="MaterialIcons"
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DefaultTheme.colors.background,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
  changePictureText: {
    marginTop: 8,
    color: '#007bff',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  itemLabel: {
    fontWeight: '500',
    color: '#333',
  },
  itemValue: {
    color: '#555',
  },
  closeAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.2,
    elevation: 1,
    padding: 5,
    width: '100%',
    marginTop: 20,
    alignSelf: 'center',
  },
  closeAccountText: {
    fontSize: RFValue(14),
    color: 'red',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
});
