import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {useAppDispatch} from '@store/reduxHook';
import {navigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {saveNotification} from './firebaseNotification';

export const useNotificationHandlers = () => {
  const dispatch = useAppDispatch();
  const {user} = useUser();

  useEffect(() => {
    if (!user?.uid) {
      return;
    }
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const notification = remoteMessage.notification;

      if (notification?.title && user?.uid) {
        try {
          await saveNotification(
            user.uid,
            notification.title,
            notification.body,
          );

          Toast.show({
            type: 'info',
            text1: notification.title,
            text2: notification.body,
          });
        } catch (err) {
          console.log('Notification Save Error', err);
        }
      } else {
        console.log('not called');
      }
    });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      const notification = remoteMessage?.notification;

      if (notification?.title) {
        await saveNotification(user.uid, notification.title, notification.body);
      }

      const screen = remoteMessage?.data?.screen;
      if (screen) navigate('UserBottomTab', {screen});
    });

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
