import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useUser} from '@hooks/useUser';
import auth from '@react-native-firebase/auth';
import Icon from '@components/global/Icon';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {runOnJS} from 'react-native-reanimated';
import {DefaultTheme} from '@react-navigation/native';
import EditUsernameSheet from '@components/profile/EditUsernameSheet';
import {
  ImagePickerResponse,
  launchImageLibrary,
} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  listenToCurrentUserInfo,
  signOut,
  updateUserProfile,
  uploadToCloudinary,
} from '@config/firebaseRN';
import {Colors, User} from '@utils/Constant';
import {RFValue} from 'react-native-responsive-fontsize';
import {createBackdropRenderer} from '@components/global/CreateBackdropRenderer';
import {PREMIUM_MEMBER_LIMIT} from '@components/board/Invite';
import CustomLoading from '@components/global/CustomLoading';
import {
  formatSubscriptionType,
  getRemainingDays,
  isSubscriptionExpired,
  updateIsPremiumStatus,
} from '@utils/subscription/SubscriptionUtils';
import ProfileItem from '@components/profile/ProfileItem';
import {navigate} from '@utils/NavigationUtils';
import CustomModal from '@components/global/CustomModal';

const Profile = () => {
  const {
    user: currentUser,
    logout,
    setUser,
  } = useUser() as {
    user: User & {
      subscription?: {
        isPremium: boolean;
        subscriptionType: string;
        expiryDate: string;
      };
    };
    logout: () => void;
    setUser: (user: User) => void;
  };

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasSubscription = !!currentUser?.subscription;

  const isExpired = hasSubscription
    ? isSubscriptionExpired(currentUser.subscription?.expiryDate)
    : true;
  const remainingDays =
    hasSubscription && currentUser.subscription?.expiryDate
      ? getRemainingDays(currentUser.subscription.expiryDate)
      : 0;

  const confirmCloseAccount = () => {
    Alert.alert(
      'Close Account',
      'Are you sure you want to close your account? This action will sign you out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Close',
          style: 'destructive',
          onPress: () => handleCloseAccount(),
        },
      ],
      {cancelable: true},
    );
  };

  const handleCloseAccount = async () => {
    try {
      setLoading(true);
      const googleUser = GoogleSignin.getCurrentUser();
      if (googleUser) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await signOut();
      logout();
    } catch (error) {
      console.log('Error closing account:', error);
    } finally {
      setLoading(false);
    }
  };

  const onCancelModal = () => {
    runOnJS(() => {
      bottomSheetRef.current?.close();
    })();
  };

  const renderBackdrop = useMemo(
    () => createBackdropRenderer(onCancelModal),
    [onCancelModal],
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
            text2: "You didn't choose an image. Try again if needed.",
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

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToCurrentUserInfo(
      async updatedUser => {
        setUser(updatedUser);
        setLoading(false);

        const subscription = updatedUser.subscription;
        if (!subscription || !subscription.isPremium) return;

        if (
          updatedUser.subscription?.isPremium &&
          isSubscriptionExpired(updatedUser?.subscription?.expiryDate)
        ) {
          await updateIsPremiumStatus(updatedUser.uid);
        }
      },
      error => {
        console.log('Realtime user subscription error:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const renderSubscriptionSection = () => {
    if (!hasSubscription) {
      return renderFreePlanSection();
    }

    return (
      <View>
        <View style={styles.subscriptionHeader}>
          <Icon
            name={isExpired ? 'star-outline' : 'crown'}
            iconFamily={isExpired ? 'Ionicons' : 'MaterialCommunityIcons'}
            size={22}
            color={isExpired ? '#666' : Colors.lightprimary}
          />
          <Text style={styles.subscriptionTitle}>
            {isExpired ? 'Expired Subscription' : 'Premium Subscription'}
          </Text>
        </View>

        <View style={styles.subscriptionCard}>
          <ProfileItem
            label="Plan"
            value={formatSubscriptionType(
              currentUser.subscription?.subscriptionType || '',
            )}
          />
          <ProfileItem
            label="Status"
            value={isExpired ? 'Inactive' : 'Active'}
            valueStyle={isExpired ? styles.inactiveStatus : styles.activeStatus}
          />
          {!isExpired && (
            <ProfileItem
              label="Expires In"
              value={`${remainingDays} days`}
              valueStyle={remainingDays < 7 ? styles.expiringStatus : undefined}
            />
          )}
          {isExpired && (
            <TouchableOpacity
              style={styles.renewSubscriptionButton}
              onPress={() => navigate('SubscriptionScreen')}>
              <Icon
                name="refresh"
                iconFamily="Ionicons"
                size={18}
                color="#fff"
              />
              <Text style={styles.renewSubscriptionText}>
                Renew Subscription
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFreePlanSection = () => {
    return (
      <View>
        <View style={styles.subscriptionHeader}>
          <Icon
            name="star-outline"
            iconFamily="Ionicons"
            size={22}
            color="#666"
          />
          <Text style={styles.subscriptionTitle}>Subscription</Text>
        </View>

        <View style={styles.freeSubscriptionCard}>
          <View style={styles.freeStatusContainer}>
            <Text style={styles.freeStatusText}>Free Plan</Text>
            <Text style={styles.freeStatusDescription}>
              You're currently on the free plan
            </Text>
          </View>

          <TouchableOpacity
            style={styles.upgradeToPremiumButton}
            onPress={() => navigate('SubscriptionScreen')}>
            <Icon
              name="crown"
              iconFamily="MaterialCommunityIcons"
              size={18}
              color="#fff"
            />
            <Text style={styles.upgradeToPremiumText}>Upgrade to Premium</Text>
          </TouchableOpacity>

          <Text style={styles.premiumBenefitsTitle}>Premium Benefits:</Text>
          <View style={styles.premiumBenefitsContainer}>
            <View style={styles.benefitRow}>
              <Icon
                name="checkmark-circle"
                iconFamily="Ionicons"
                size={16}
                color="#4CAF50"
              />
              <Text style={styles.benefitText}>
                Up to {PREMIUM_MEMBER_LIMIT} members per board
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon
                name="checkmark-circle"
                iconFamily="Ionicons"
                size={16}
                color="#4CAF50"
              />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon
                name="checkmark-circle"
                iconFamily="Ionicons"
                size={16}
                color="#4CAF50"
              />
              <Text style={styles.benefitText}>Advanced board features</Text>
            </View>
          </View>
        </View>
      </View>
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

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={Colors.lightprimary} />
        </View>
      ) : (
        renderSubscriptionSection()
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={confirmCloseAccount}>
        <Icon
          name="log-out-outline"
          iconFamily="Ionicons"
          size={22}
          color={Colors.black}
        />
        <Text style={styles.logoutText}>Log out</Text>
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
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustPan">
        <BottomSheetView>
          <EditUsernameSheet onClose={() => bottomSheetRef.current?.close()} />
        </BottomSheetView>
      </BottomSheetModal>
    </ScrollView>
  );
};

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

  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  subscriptionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  subscriptionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  freeSubscriptionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  freeStatusContainer: {
    marginBottom: 16,
  },
  freeStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  freeStatusDescription: {
    color: '#777',
    fontSize: 14,
  },
  upgradeToPremiumButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  upgradeToPremiumText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  renewSubscriptionButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  renewSubscriptionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  premiumBenefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  premiumBenefitsContainer: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    color: '#555',
    fontSize: 14,
  },
  logoutButton: {
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
    padding: 12,
    width: '100%',
    marginTop: 15,
    marginBottom: 50,
    alignSelf: 'center',
  },
  logoutText: {
    fontSize: RFValue(14),
    color: 'red',
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  activeStatus: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  inactiveStatus: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  expiringStatus: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
});
