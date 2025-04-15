// components/SearchBar.tsx
import React, {FC} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
} from 'react-native';

import Icon from '@components/global/Icon';
import {Colors} from '@utils/Constant';

interface CustomSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  OnSearch: () => void;
}

const CustomSearchBar: FC<CustomSearchBarProps> = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  OnSearch,
}) => {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.icon}>
          <Icon name="search" size={20} color="#888" iconFamily="Ionicons" />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || 'Search'}
          placeholderTextColor={Colors.placeholdertext}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Pressable onPress={onClear} style={styles.clearIcon}>
            <Icon
              name="close-circle"
              size={20}
              color="#888"
              iconFamily="Ionicons"
            />
          </Pressable>
        )}
      </View>
      {value.length > 0 && (
        <TouchableOpacity
          onPress={OnSearch}
          activeOpacity={0.8}
          style={{
            justifyContent: 'center',
            marginRight: 10,
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: Colors.lightprimary,
              fontSize: 16,
            }}>
            Search
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
    borderWidth: 1,
    borderColor: '#c7c7cc',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    borderRadius: 10,
    margin: 10,
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    color: Colors.black,
  },
  clearIcon: {
    marginLeft: 6,
  },
});

export default CustomSearchBar;
