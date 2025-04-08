import Icon from '@components/global/Icon';
import LoginScreen from '@features/auth/LoginScreen';
import OnBoarding from '@features/auth/OnBoarding';
import SignUpScreen from '@features/auth/SignUpScreen';
import SplashScreen from '@features/auth/SplashScreen';
import BGSelect from '@features/board/BGSelect';
import CreateBoard from '@features/board/CreateBoard';
import VisibilitySelect from '@features/board/VisibilitySelect';
import UserBottomTab from '@features/tabs/UserBottomTab';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '@utils/Constant';
import {goBack, navigationRef} from '@utils/NavigationUtils';
import {screenWidth} from '@utils/Scaling';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

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
            <TouchableOpacity onPress={() => goBack()}>
              <Icon
                name="close"
                size={26}
                color={Colors.lightprimary}
                iconFamily="Ionicons"
              />
            </TouchableOpacity>
          ),

          headerRight: () => (
            <View style={styles.btnContainer}>
              <TouchableOpacity>
                <Text style={styles.btnText}>Create</Text>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity onPress={() => goBack()}>
              <Icon
                name="close"
                size={26}
                color={Colors.lightprimary}
                iconFamily="Ionicons"
              />
            </TouchableOpacity>
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
            <TouchableOpacity onPress={() => goBack()}>
              <Icon
                name="close"
                size={26}
                color={Colors.lightprimary}
                iconFamily="Ionicons"
              />
            </TouchableOpacity>
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
