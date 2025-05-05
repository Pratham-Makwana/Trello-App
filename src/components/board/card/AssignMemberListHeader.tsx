import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {FC} from 'react';
import {Colors} from '@utils/Constant';
import {RFValue} from 'react-native-responsive-fontsize';
import Icon from '@components/global/Icon';

interface AssignMemberListHeaderProps {
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}
const AssignMemberListHeader: FC<AssignMemberListHeaderProps> = ({
  searchText,
  setSearchText,
}) => {
  return (
    <>
      <View style={styles.flatListHeaderContainer}>
        <View style={styles.flatListHeaderContent}>
          <Icon
            name="people-outline"
            iconFamily="Ionicons"
            size={18}
            color={Colors.white}
          />
          <Text style={styles.flatListHeaderText}>Assigned Members</Text>
        </View>
      </View>
      <TextInput
        style={styles.search}
        placeholder="Search members..."
        placeholderTextColor={Colors.placeholdertext}
        value={searchText}
        onChangeText={text => setSearchText(text.trim())}
      />
    </>
  );
};

export default AssignMemberListHeader;

const styles = StyleSheet.create({
  flatListHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.lightprimary,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flatListHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  flatListHeaderText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontWeight: '500',
  },
  search: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 8,
    color: Colors.black,
  },
});
