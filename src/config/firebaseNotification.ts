import messaging from '@react-native-firebase/messaging';
import {navigate} from '@utils/NavigationUtils';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
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

export const setupBackgroundAndForegroundHandlers = () => {
  // Foreground handler
  // messaging().onMessage(async remoteMessage => {
  //   const dispatch = useAppDispatch();
  //   if (remoteMessage?.notification?.title) {
  //     console.log('==> Foreground handler ', remoteMessage);

  //     Toast.show({
  //       type: 'info',
  //       text1: remoteMessage.notification?.title,
  //       text2: remoteMessage.notification?.body,
  //     });
  //     dispatch(
  //       addNotification({
  //         id: remoteMessage.messageId ?? 'unknown-id',
  //         title: remoteMessage.notification?.title,
  //         body: remoteMessage.notification?.body || '',
  //       }),
  //     );
  //   }
  // });

  // Background & Quit state
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    const screen = remoteMessage?.data?.screen;

    if (typeof screen === 'string') {
      navigate(screen);
    }
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        const screen = remoteMessage?.data?.screen;
        if (typeof screen === 'string') {
          navigate('UserBottomTab', {
            screen,
          });
        }
      }
    });
};

export const sendNotificationToOtherUser = async (
  notificationToken: string,
  title: string,
  body: string,
  screen?: string,
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
    const response = await fetch(
      'http://192.168.200.98:5000/api/notification/send-token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationToken,
          title,
          body,
          screen,
        }),
      },
    );

    return response.ok;
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
  console.log('==> saveNotification called');

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

export const clearAllNotifications = async (userId: string ) => {
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
