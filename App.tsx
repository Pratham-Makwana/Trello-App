import Navigation from '@navigation/Navigation';
import {ColorProvider} from './src/context/ColorContext';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ColorProvider>
        <Navigation />
      </ColorProvider>
    </GestureHandlerRootView>
  );
}

export default App;
