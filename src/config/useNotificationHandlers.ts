import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import {useAppDispatch} from '@store/reduxHook';
import {addNotification} from '@store/notification/notificationSlice';
import {navigate} from '@utils/NavigationUtils';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '@hooks/useUser';
import {saveNotification} from './firebaseNotification';

export const useNotificationHandlers = () => {
  const dispatch = useAppDispatch();
  const {user} = useUser();

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const notification = remoteMessage.notification;

      if (notification?.title) {
        Toast.show({
          type: 'info',
          text1: notification.title,
          text2: notification.body,
        });

        await saveNotification(
          user!.uid,
          notification.title,
          notification.body,
        );

        dispatch(
          addNotification({
            id: remoteMessage.messageId || '',
            title: notification.title,
            body: notification.body || '',
          }),
        );
      }
    });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      const notification = remoteMessage.notification;
      if (notification?.body && notification?.title) {
        await saveNotification(
          user!.uid,
          notification.title,
          notification.body,
        );
      }
      const screen = remoteMessage?.data?.screen;
      if (typeof screen === 'string') {
        navigate(screen);
      }
    });

    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        const notification = remoteMessage?.notification;
        if (notification) {
          if (notification?.body && notification?.title) {
            await saveNotification(
              user!.uid,
              notification.title,
              notification.body,
            );
          }
        }
        if (remoteMessage) {
          const screen = remoteMessage?.data?.screen;
          if (screen) {
            navigate('UserBottomTab', {screen});
          }
        }
      });

    return () => unsubscribe();
  }, [dispatch]);
};
