import Navigation from '@navigation/Navigation';
import {BoardProvider} from './src/context/BoardContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from '@context/UserContext';
import {useEffect} from 'react';
import {
  requestNotificationPermission,
  setupBackgroundAndForegroundHandlers,
} from '@config/firebaseNotification';

function App(): React.JSX.Element {
  useEffect(() => {
    requestNotificationPermission();
    setupBackgroundAndForegroundHandlers();
  }, []);
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <BoardProvider>
          <Navigation />
        </BoardProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
