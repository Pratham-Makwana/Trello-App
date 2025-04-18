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
import {goBack, navigationRef} from '@utils/NavigationUtils';
import {screenWidth} from '@utils/Scaling';
import {Alert, Platform, StyleSheet} from 'react-native';
import {useEffect, useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';
import Invite from '@components/board/Invite';
import {useAppDispatch} from '@store/reduxHook';
import {useUser} from '@hooks/useUser';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const {user, setUser} = useUser();
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const serializedUser = {
          uid: user.uid,
          username: user.displayName || null,
          email: user.email || null,
          photoURL: user.photoURL || null,
        };
        console.log('==> user', serializedUser);

        setUser(serializedUser);
        setInitializing(false);
      } else {
        console.log('==> user', user);
        setInitializing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const MainStack = () => {
  const dispatch = useAppDispatch();
  const {boardName, selectedWorkSpace, selectedColor, setBoardName} =
    useBoard();

  const handleCreateBoard = () => {
    if (boardName.length > 0 && boardName !== '') {
      createBoard(dispatch, boardName, selectedColor, selectedWorkSpace);
      setBoardName('');
      Alert.alert('Board Created Successfully');
      goBack();
    } else {
      Alert.alert('Please Enter a Board Name');
    }
  };

  return (
    <Stack.Navigator initialRouteName="UserBottomTab">
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

      <Stack.Screen
        name="Invite"
        component={Invite}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="OnBoarding">
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
