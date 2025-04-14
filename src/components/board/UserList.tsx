import {
  Image,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC} from 'react';
import {Colors, User} from '@utils/Constant';

interface UserListProps {
  onPress?: (user: User) => void;
  member: User;
}

const UserList: FC<UserListProps> = ({member, onPress}) => {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
      <Image source={{uri: member.photoURL}} style={{width: 30, height: 30}} />
      <View>
        <Text style={{fontSize: 16, fontWeight: 'semibold', color : Colors.black}}>
          {member.username}
        </Text>
        <Text style={{color: Colors.fontDark}}>{member.email}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default UserList;

const styles = StyleSheet.create({});
