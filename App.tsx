import Navigation from '@navigation/Navigation';
import {ColorProvider} from './src/context/ColorContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {AuthProvider} from '@context/UserContext';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <ColorProvider>
          <Navigation />
        </ColorProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default App;
