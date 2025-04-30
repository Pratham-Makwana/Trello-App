import React, {useEffect} from 'react';
import BoardScreen from '@features/board/BoardScreen';
import Profile from '@features/profile/Profile';
import Icon from '@components/global/Icon';
import CustomText from '@components/ui/CustomText';
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Colors, DarkColors} from '@utils/Constant';
import {RFValue} from 'react-native-responsive-fontsize';
import DropdownPlus from '@components/board/DropdownPlus';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {listenToPendingInvites} from '@config/firebaseRN';
import {setPendingInvites} from '@store/invite/inviteSlice';
import InviteScreen from '@features/invite/InviteScreen';
import NotificationScreen from '@features/notification/NotificationScreen';
import {setNotifications} from '@store/notification/notificationSlice';
import firestore from '@react-native-firebase/firestore';
import {listenToNotifications} from '@config/firebaseNotification';

const Tab = createBottomTabNavigator();

const UserBottomTab = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.user.currentUser);
  const pendingInvites = useAppSelector(state => state.invite.pendingInvites);
  const unreadCount = useAppSelector(
    state => state.notification.notifications.filter(n => !n.read).length,
  );
  useEffect(() => {
    let unsubscribe: () => void;

    const subscribe = async () => {
      unsubscribe = listenToPendingInvites(currentUser!.uid, data => {
        dispatch(setPendingInvites(data));
      });
    };

    subscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = listenToNotifications(currentUser?.uid, data => {
      dispatch(setNotifications(data));
    });

    return () => unsubscribe();
  }, [currentUser?.uid, dispatch]);

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
        name="invite"
        component={InviteScreen}
        options={{
          title: 'Invites',
          tabBarIcon: ({color, focused, size}) => (
            <View style={{position: 'relative'}}>
              {pendingInvites.length > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -6,
                    backgroundColor: Colors.lightprimary,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}>
                    {pendingInvites.length}
                  </Text>
                </View>
              )}

              {/* Icon */}
              <Icon
                name="view-dashboard-variant-outline"
                iconFamily="MaterialCommunityIcons"
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="notification"
        component={NotificationScreen}
        options={{
          title: 'Notifications',
          tabBarIcon: ({color, focused, size}) => (
            <View style={{position: 'relative'}}>
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    backgroundColor: Colors.lightprimary,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}>
                    {unreadCount}
                  </Text>
                </View>
              )}

              <Icon
                name="notifications-outline"
                iconFamily="Ionicons"
                size={size}
                color={color}
              />
            </View>
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
