import Navigation from '@navigation/Navigation';
import {BoardProvider} from './src/context/BoardContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from '@context/UserContext';

function App(): React.JSX.Element {
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
