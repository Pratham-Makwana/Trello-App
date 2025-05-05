import messaging from '@react-native-firebase/messaging';
import {navigate} from '@utils/NavigationUtils';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Notification} from '@utils/Constant';
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
};

export const hasNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  } else if (Platform.OS === 'android') {
    const result = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result;
  }
  return false;
};

export const sendNotificationToOtherUser = async (
  userId: string,
  title: string,
  body: string,
  screen?: string,
  data?: any,
) => {
  try {
    const isPermissionGranted = await hasNotificationPermission();

    if (!isPermissionGranted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to send alerts.',
        [{text: 'OK'}],
      );
      return;
    }

    await fetch('http://192.168.200.98:5000/api/notification/send-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        screen,
        data,
      }),
    });

    return true;
  } catch (error) {
    console.log('Error sending notification:', error);
    return false;
  }
};

export const saveNotification = async (
  id: string,
  title: string,
  body: string | undefined,
) => {
  try {
    await firestore().collection('notifications').add({
      userId: id,
      title,
      body,
      read: false,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.log('==> saveNotification Error', error);
  }
};

export const clearAllNotifications = async (userId: string) => {
  try {
    const snapshot = await firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .get();

    const batch = firestore().batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.log(' Error clearing notifications:', error);
  }
};

export const listenToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
): (() => void) => {
  const unsubscribe = firestore()
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      snapshot => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title || '',
          body: doc.data().body || '',
          read: doc.data().read || false,
          createdAt:
            doc.data().createdAt?.toDate().toISOString() ||
            new Date().toISOString(),
        }));

        callback(notificationsData);
      },
      error => {
        console.error('Error listening to notifications:', error);
      },
    );

  return unsubscribe;
};
