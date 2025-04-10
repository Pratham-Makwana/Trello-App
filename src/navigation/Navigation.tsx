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
import BoardCard from '@features/board/boardcard/BoardCard';
import BoardMenu from '@features/board/boardmenu/BoardMenu';
import {auth, createBoard} from '@config/firebase';
import {useBoard} from '@context/BoardContext';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '@utils/Constant';
import {
  goBack,
  navigate,
  navigationRef,
  resetAndNavigate,
} from '@utils/NavigationUtils';
import {screenWidth} from '@utils/Scaling';
import {Alert, Platform, StyleSheet} from 'react-native';
import {useEffect} from 'react';
import {useAuthContext} from '@context/UserContext';
import {onAuthStateChanged} from 'firebase/auth';
import {webClientId} from '@env';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const {setUser, user} = useAuthContext();
  // console.log('==> Navigation', user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        console.log('==> user', user);

        setUser(user);

        resetAndNavigate('MainStack', {screen: 'board'});
      }
    });
    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   const intialStartup = () => {
  //     GoogleSignin.configure({
  //       webClientId: webClientId,
  //     });
  //     // if (user) {
  //     //   console.log('==> SplashScreen:user: ', user);
  //     //   console.log('==> MainStack Screen Board Screen');
  //     //   resetAndNavigate('MainStack', {screen: 'board'});
  //     // } else {
  //     //   console.log('else', user);

  //     //   console.log('==> OnBoarding Screen');
  //     //   navigate('OnBoarding');
  //     // }
  //   };
  //   const timeOut = setTimeout(intialStartup, 2000);
  //   return () => clearTimeout(timeOut);
  // }, [user, setUser]);

  return (
    <NavigationContainer ref={navigationRef}>
      {/* {
        user ? <MainStack /> : <AuthStack /> 
      } */}
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

      <Stack.Screen
        name="BoardCard"
        component={BoardCard}
        options={{
          headerShown: false,
          headerTransparent: true,
          // header: () => <CustomHeader />,
        }}
      />
      <Stack.Screen
        name="BoardMenu"
        component={BoardMenu}
        options={{
          title: 'Board Menu',
          presentation: Platform.OS == 'ios' ? 'modal' : 'card',
          headerLeft: () =>
            Platform.OS == 'ios' && (
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
