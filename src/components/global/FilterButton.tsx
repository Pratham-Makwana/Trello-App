import {Colors} from '@utils/Constant';
import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

type FilterButtonProps = {
  onPress: () => void;
  label: string;
};

const FilterButton = ({onPress, label}: FilterButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.lightprimary,
    padding: 8,
    borderRadius: 5,
  },
  label: {
    color: Colors.white,
    fontSize: RFValue(12),
  },
});

export default FilterButton;
