import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useState} from 'react';
import {Colors} from '@utils/Constant';
import CustomText from '@components/ui/CustomText';

interface ListTitleInputProps {
  onCancle : () => void
  onSave : (title : string)=> void
}
const ListTitleInput:FC<ListTitleInputProps> = ({onCancle,onSave}) => {
  const [listTitle, setListTitle] = useState('');
  return (
    <View style={styles.card}>
      <TextInput
        value={listTitle}
        onChangeText={setListTitle}
        style={styles.input}
        placeholder="List title"
        placeholderTextColor={Colors.textgrey}
        autoFocus
      />
      <View style={styles.btnContainer}>
        <TouchableOpacity activeOpacity={0.8} onPress={onCancle}>
          <CustomText
            fontSize={13}
            fontFamily="Montserrat-Medium"
            style={styles.btnText}>
            Cancle
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={() => onSave(listTitle)}>
          <CustomText
            fontSize={13}
            fontFamily="Montserrat-Medium"
            style={styles.btnText}>
            Add
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListTitleInput;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 6,
    // marginBottom: 16,
    width: '100%',
    // height: 90,
  },
  input: {
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.textgrey,
    borderRadius: 4,
    marginBottom: 8,
    color : Colors.black
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  btnText: {
    color: Colors.lightprimary,
  },
});
