import React from 'react';
import BoardScreen from '@features/board/BoardScreen';
import CardScreen from '@features/card/CardScreen';
import Profile from '@features/profile/Profile';
import Icon from '@components/global/Icon';
import Notification from '@features/notification/Notification';
import CustomText from '@components/ui/CustomText';
import {Platform, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors, DarkColors} from '@utils/Constant';
import {RFValue} from 'react-native-responsive-fontsize';
import DropdownPlus from '@components/board/DropdownPlus';

const Tab = createBottomTabNavigator();

const UserBottomTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="board"
      screenOptions={{
        tabBarActiveTintColor: Colors.lightprimary,
        headerStyle: {
          backgroundColor: Colors.lightprimary,
        },
        headerTitleStyle: {
          color: 'white',
        },
      }}>
      <Tab.Screen
        name="board"
        component={BoardScreen}
        options={{
          headerTitle: '',
          tabBarIcon: ({color, size, focused}) => (
            <Icon
              name="trello"
              color={color}
              iconFamily="MaterialCommunityIcons"
              size={size}
            />
          ),
          headerStyle: {
            // backgroundColor: DarkColors.headerbgcolor
            backgroundColor: Colors.lightprimary,
          },
          headerRight: () => (
            <View
              style={{
                paddingHorizontal: 10,
                marginBottom: Platform.OS == 'ios' ? 5 : 0,
              }}>
              <DropdownPlus />
            </View>
          ),
          headerLeft: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                paddingHorizontal: 10,
                marginBottom: Platform.OS == 'ios' ? 10 : 0,
              }}>
              <Icon
                name="trello"
                color="#fff"
                iconFamily="MaterialCommunityIcons"
                size={RFValue(18)}
              />
              <CustomText
                variant="h2"
                fontFamily="Montserrat-SemiBold"
                color="#fff">
                Trello
              </CustomText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="card"
        component={CardScreen}
        options={{
          title: 'My Card',
          tabBarIcon: ({color, focused, size}) => (
            <Icon
              name="view-dashboard-variant-outline"
              iconFamily="MaterialCommunityIcons"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="notification"
        component={Notification}
        options={{
          title: 'Notifications',
          tabBarIcon: ({color, focused, size}) => (
            <Icon
              name="notifications-outline"
              iconFamily="Ionicons"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="account"
        component={Profile}
        options={{
          title: 'Account',
          tabBarIcon: ({color, size}) => (
            <Icon
              name="user-circle"
              iconFamily="FontAwesome"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default UserBottomTab;
