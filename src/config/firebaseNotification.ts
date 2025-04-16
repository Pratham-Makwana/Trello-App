import messaging from '@react-native-firebase/messaging';

import {Platform, PermissionsAndroid, Alert} from 'react-native';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ iOS notification permission granted:', authStatus);
    } else {
      console.log('❌ iOS notification permission denied');
    }
  } else if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Android (13+) notification permission granted');
    } else {
      console.log('❌ Android (13+) notification permission denied');
    }
  }
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
