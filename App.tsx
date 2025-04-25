import Navigation from '@navigation/Navigation';
import {BoardProvider} from './src/context/BoardContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from '@context/UserContext';
import {useEffect} from 'react';
import {
  requestNotificationPermission,
  setupBackgroundAndForegroundHandlers,
} from '@config/firebaseNotification';
import {Provider} from 'react-redux'; 
import store from '@store/store';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

function App(): React.JSX.Element {
  useEffect(() => {
    requestNotificationPermission();
    setupBackgroundAndForegroundHandlers();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Direct fallback foreground message:', remoteMessage);
    });

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <BoardProvider>
              <Navigation />
              <Toast />
            </BoardProvider>
          </BottomSheetModalProvider>
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
