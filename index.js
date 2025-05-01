/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
import messaging from '@react-native-firebase/messaging';
import {saveNotification} from '@config/firebaseNotification';
import store from '@store/store';
import notifee from '@notifee/react-native';
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// For Not To Use Their MobileFonts
if (Text.defaultProps) {
  Text.defaultProps.allowFontScaling = false;
} else {
  Text.defaultProps = {};
  Text.defaultProps.allowFontScaling = false;
}
if (TextInput.defaultProps) {
  TextInput.defaultProps.allowFontScaling = false;
} else {
  TextInput.defaultProps = {};
  TextInput.defaultProps.allowFontScaling = false;
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const notification = remoteMessage.notification;
  const state = store.getState();
  const userId = state.user.currentUser?.uid;

  if (notification?.title && userId) {
    try {
      await saveNotification(userId, notification.title, notification.body);
      const notifeeNotification = {
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
        },
        ios: {
          sound: 'default',
        },
      };

      await notifee.displayNotification(notifeeNotification);
    } catch (err) {
      console.log('Notification Save Error', err);
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
