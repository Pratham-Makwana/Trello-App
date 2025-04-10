import CustomHeaderLeft from '@components/global/CustomHeaderLeft';
import CustomHeaderRight from '@components/global/CustomHeaderRight';
import LoginScreen from '@features/auth/LoginScreen';
import OnBoarding from '@features/auth/OnBoarding';
import SignUpScreen from '@features/auth/SignUpScreen';
import SplashScreen from '@features/auth/SplashScreen';
import BGSelect from '@features/board/BGSelect';
import CreateBoard from '@features/board/CreateBoard';
import VisibilitySelect from '@features/board/VisibilitySelect';
import UserBottomTab from '@features/tabs/UserBottomTab';
import {createBoard} from '@config/firebase';
import {useBoard} from '@context/BoardContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '@utils/Constant';
import {goBack, navigationRef} from '@utils/NavigationUtils';
import {screenWidth} from '@utils/Scaling';
import {Alert, StyleSheet} from 'react-native';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="AuthStack"
          component={AuthStack}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="MainStack"
          component={MainStack}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// const ModalStack = () => {
//   return <Stack.Navigator></Stack.Navigator>;
// };

const MainStack = () => {
  const {boardName, selectedWorkSpace, selectedColor} = useBoard();

  const handleCreateBoard = () => {
    if (boardName.length > 0 && boardName !== '') {
      createBoard(boardName, selectedColor, selectedWorkSpace);
      Alert.alert('Board Created Successfully');
      goBack();
    } else {
      Alert.alert('Please Enter a Board Name');
    }
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserBottomTab"
        component={UserBottomTab}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CreateBoard"
        component={CreateBoard}
        options={{
          title: 'Board',
          presentation: 'modal',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.grey,
          },
          headerLeft: () => (
            <CustomHeaderLeft
              iconName="close"
              iconSize={26}
              iconFamily="Ionicons"
              onPress={goBack}
            />
          ),

          headerRight: () => (
            <CustomHeaderRight onPress={handleCreateBoard} title="Create" />
          ),
        }}
      />
      <Stack.Screen
        name="BGSelect"
        component={BGSelect}
        options={{
          title: 'Board Background',
          headerStyle: {
            backgroundColor: Colors.grey,
          },
          headerLeft: () => (
            <CustomHeaderLeft
              iconName="close"
              iconSize={26}
              iconFamily="Ionicons"
              onPress={goBack}
            />
          ),
        }}
      />
      <Stack.Screen
        name="VisibilitySelect"
        component={VisibilitySelect}
        options={{
          title: 'Visibility',
          headerStyle: {
            backgroundColor: Colors.grey,
          },
          headerLeft: () => (
            <CustomHeaderLeft
              iconName="close"
              iconSize={26}
              iconFamily="Ionicons"
              onPress={goBack}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OnBoarding"
        component={OnBoarding}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  btnContainer: {
    width: screenWidth * 0.18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnTextDisabled: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textgrey,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.lightprimary,
  },
});
