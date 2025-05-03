import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {useAppDispatch} from '@store/reduxHook';
import {navigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {saveNotification} from './firebaseNotification';
import notifee, {EventType} from '@notifee/react-native';

export const useNotificationHandlers = () => {
  const dispatch = useAppDispatch();
  const {user} = useUser();

  useEffect(() => {
    if (!user?.uid) {
      return;
    }
    // Foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log("==> remote", remoteMessage);
      
      const notification = remoteMessage.notification;

      if (notification?.title && user?.uid) {
        try {
          await saveNotification(
            user.uid,
            notification.title,
            notification.body,
          );
          const notifeeNotification = {
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            android: {
              channelId: 'default',
            },
            ios: {
              sound: 'default',
            },
            data: remoteMessage.data,
          };

          await notifee.displayNotification(notifeeNotification);

          notifee.onForegroundEvent(({type, detail}) => {
            console.log("==> details", detail);
            
            if (type === EventType.PRESS && detail.notification?.data?.screen) {
              navigate('UserBottomTab', {
                screen: detail?.notification?.data?.screen,
              });
            }
          });
        } catch (err) {
          console.log('Notification Save Error', err);
        }
      }
    });

    // When the app is in background, and user taps a notification:
    messaging().onNotificationOpenedApp(async remoteMessage => {
      const notification = remoteMessage?.notification;

      if (notification?.title) {
        await saveNotification(user.uid, notification.title, notification.body);
      }

      const screen = remoteMessage?.data?.screen;
      if (screen) navigate('UserBottomTab', {screen});
    });

    // When the app is completely closed and started by tapping the notification:
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        const notification = remoteMessage?.notification;

        if (notification?.title) {
          await saveNotification(
            user.uid,
            notification.title,
            notification.body,
          );
        }

        const screen = remoteMessage?.data?.screen;
        if (screen) navigate('UserBottomTab', {screen});
      });

    return () => unsubscribe();
  }, [dispatch, user?.uid]);
};
