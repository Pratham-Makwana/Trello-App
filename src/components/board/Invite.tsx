import {FlatList, StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import CustomSearchBar from './CustomSearchBar';
import UserList from './UserList';
import LottieView from 'lottie-react-native';
import notFound from '@assets/animation/notfound.json';
import {screenWidth} from '@utils/Scaling';
import {RouteProp, useRoute} from '@react-navigation/native';
import {goBack} from '@utils/NavigationUtils';
import {User} from '@utils/Constant';
import Toast from 'react-native-toast-message';
import {sendNotificationToOtherUser} from '@config/firebaseNotification';
import {useAppSelector} from '@store/reduxHook';
import {findUsers, sendBoardInvite} from '@config/firebaseRN';

const Invite = () => {
  const route =
    useRoute<RouteProp<{Invite: {boardId: string; title: string}}>>();
  const {boardId, title} = route.params;
  const currentUser = useAppSelector(state => state.user.currentUser);

  const [search, setSearch] = useState('');

  const [isSearch, setIsSearch] = useState(false);
  const [searchUser, setSearchUser] = useState<any>([]);
  const onClear = () => {
    setSearch('');
    setSearchUser([]);
  };
  const onUserSearch = async () => {
    const users = await findUsers(search.trim());
    setSearchUser(users);
  };

  const onAddUser = async (user: User) => {
    try {
      Toast.show({
        type: 'success',
        text1: 'Invitation Sent 🎉',
        text2: `Your invitation to join the "${title}" board has been sent.`,
      });

      if (user?.notificationToken) {
        sendNotificationToOtherUser(
          user.notificationToken,
          '📩 Board Invitation',
          `you've been invited to collaborate on a ${title} board. Tap to join and start working together!`,
          'notification',
        );

        await sendBoardInvite(boardId, user?.uid, currentUser!.uid);
        setTimeout(() => {
          goBack();
        }, 1000);
      } else {
        console.error('Notification token is undefined');
      }
    } catch (error) {
      console.log('Error On Add User', error);
    }
  };
  return (
    <>
      <CustomSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="search user by email"
        onClear={onClear}
        OnSearch={onUserSearch}
      />

      <View style={{paddingHorizontal: 20, flex: 1}}>
        <FlatList
          data={searchUser}
          keyExtractor={item => item.uid}
          renderItem={({item}) => (
            <UserList member={item} onPress={onAddUser} addUser={true} />
          )}
          contentContainerStyle={{gap: 8}}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LottieView
                source={notFound}
                loop
                autoPlay
                style={{width: screenWidth * 0.5, height: screenWidth}}
              />
            </View>
          )}
          style={{marginVertical: 12}}
        />
      </View>
      <Toast />
    </>
  );
};

export default Invite;

const styles = StyleSheet.create({});

// B5OrKfLq0YUhqeL0ejJiXEnB6fM2 other user
// sb1xCz7yEaZNp9WKm4JgFnIKTRm1 current user
