import messaging from '@react-native-firebase/messaging';

import {Platform, PermissionsAndroid, Alert} from 'react-native';
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log(
      enabled
        ? '✅ iOS notification permission granted'
        : '❌ iOS notification permission denied'
    );
    return enabled;
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    console.log(
      granted === PermissionsAndroid.RESULTS.GRANTED
        ? '✅ Android (13+) notification permission granted'
        : '❌ Android (13+) notification permission denied'
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
  messaging().onMessage(async remoteMessage => {
    console.log('Foreground message:', remoteMessage);
    // Show in-app notification here if needed
  });

  // Background & Quit state
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message:', remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background:',
      remoteMessage.notification,
    );
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'App opened from quit state by notification:',
          remoteMessage.notification,
        );
      }
    });
};


export const sendNotificationToOtherUser = async (
  notificationToken: string,
  title: string,
  body: string,
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
        }),
      },
    );

    const result = await response.json();
    console.log('Notification result:', result);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};