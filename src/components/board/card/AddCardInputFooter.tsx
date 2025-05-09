import {StyleSheet, TextInput, View} from 'react-native';
import React, {FC, useEffect, useRef} from 'react';
import {Colors} from '@utils/Constant';

interface AddCardInputFooterProps {
  adding: boolean;
  newTask: string;
  setNewTask: (text: string) => void;
  inputRef?: React.RefObject<TextInput>;
}

const AddCardInputFooter: FC<AddCardInputFooterProps> = ({
  adding,
  newTask,
  setNewTask,
  inputRef,
}) => {
  const localInputRed = useRef<TextInput>(null);
  const textInputRef = inputRef || localInputRed;
  useEffect(() => {
    if (adding && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [adding]);

  return (
    <View style={styles.container}>
      {adding && (
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={newTask}
          onChangeText={setNewTask}
          autoCapitalize="none"
          placeholder="Add a card..."
          placeholderTextColor={Colors.fontDark}
          onSubmitEditing={() => {}}
          returnKeyType="default"
          multiline={false}
          blurOnSubmit={false}
        />
      )}
    </View>
  );
};

export default AddCardInputFooter;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 5,
  },
  input: {
    padding: 12,
    marginBottom: 5,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.2,
    borderRadius: 4,
    color: Colors.black,
    fontSize: 14,
  },
});
