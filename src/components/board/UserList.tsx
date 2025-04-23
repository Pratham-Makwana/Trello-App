import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
import {Colors, User} from '@utils/Constant';
import Icon from '@components/global/Icon';

interface UserListProps {
  onPress?: (user: User) => void;
  member: User;
  addUser?: boolean;
}

const UserList: FC<UserListProps> = ({member, onPress, addUser = false}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress?.(member)}
      style={styles.btnContainer}>
      <View style={styles.flexRowGap}>
        <Image
          source={{uri: member.photoURL}}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.text}>{member.username}</Text>
          <Text style={{color: Colors.fontDark}}>{member.email}</Text>
        </View>
      </View>

      {addUser && (
        <Icon
          name="plus"
          size={22}
          iconFamily="MaterialCommunityIcons"
          color={Colors.lightprimary}
        />
      )}
    </TouchableOpacity>
  );
};

export default UserList;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexRowGap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: Colors.black,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: '#ccc',
  },
});
