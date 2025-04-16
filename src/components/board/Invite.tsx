import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import CustomSearchBar from './CustomSearchBar';
import {addUserToBoard, findUsers} from '@config/firebase';
import UserList from './UserList';
import LottieView from 'lottie-react-native';
import notFound from '@assets/animation/notfound.json';
import {screenWidth} from '@utils/Scaling';
import {RouteProp, useRoute} from '@react-navigation/native';
import {goBack} from '@utils/NavigationUtils';
import {User} from '@utils/Constant';

const Invite = () => {
  const route = useRoute<RouteProp<{Invite: {boardId: string}}>>();
  const {boardId} = route.params;

  const [search, setSearch] = useState('');

  const [isSearch, setIsSearch] = useState(false);
  const [searchUser, setSearchUser] = useState<any>([]);

  const onClear = () => {
    setSearch('');
    setSearchUser([]);
  };
  const onUserSearch = async () => {
    const users = await findUsers(search);
    setSearchUser(users);
  };

  const onAddUser = async (user: User) => {
    try {
      await addUserToBoard(boardId, user?.uid);
      goBack();
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
    </>
  );
};

export default Invite;

const styles = StyleSheet.create({});
