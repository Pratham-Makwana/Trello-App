import Navigation from '@navigation/Navigation';
import {BoardProvider} from './src/context/BoardContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useEffect} from 'react';
import {
  requestNotificationPermission,
} from '@config/firebaseNotification';
import {Provider} from 'react-redux';
import store from '@store/store';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {webClientId} from '@env';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {FilterProvider} from '@context/FilterContext';

function App(): React.JSX.Element {
  useEffect(() => {
    requestNotificationPermission();

    async function init() {
      const has = await GoogleSignin.hasPlayServices();

      if (has) {
        GoogleSignin.configure({
          webClientId: webClientId,
        });
      }
    }

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(
      async newToken => {
        const userId = auth().currentUser?.uid;
        if (userId) {
          try {
            await firestore().collection('users').doc(userId).update({
              notificationToken: newToken,
            });
          } catch (error) {
            console.error('Error updating token:', error);
          }
        }
      },
    );

    init();

    return () => {
      unsubscribeTokenRefresh();
    };
  }, []);

  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }
    createChannel();
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <BottomSheetModalProvider>
          <BoardProvider>
            <FilterProvider>
              <Navigation />
            </FilterProvider>
            <Toast />
          </BoardProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

export default App;
