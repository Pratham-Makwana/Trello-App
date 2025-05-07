import {StyleSheet, Text, TextInput, View} from 'react-native';
import React, {FC, memo, useEffect} from 'react';
import {Colors} from '@utils/Constant';

interface AddCardInputFooterProps {
  adding: boolean;
  newTask: string;
  setNewTask: (text: string) => void;
}

// const AddCardInputFooter: FC<AddCardInputFooterProps> = React.memo(
//   ({adding, newTask, setNewTask}) => {
//     return (
//       <View>
//         {adding && (
//           <TextInput
//             style={styles.input}
//             value={newTask}
//             onChangeText={setNewTask}
//             autoCapitalize="none"
//             autoFocus
//           />
//         )}
//       </View>
//     );
//   },
// );
const AddCardInputFooter: FC<AddCardInputFooterProps> = ({
  adding,
  newTask,
  setNewTask,
}) => {
  return (
    <View>
      {adding && (
        <TextInput
          style={styles.input}
          value={newTask}
          onChangeText={setNewTask}
          autoCapitalize="none"
        />
      )}
    </View>
  );
};

export default AddCardInputFooter;

const styles = StyleSheet.create({
  input: {
    padding: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1.2,
    borderRadius: 4,
    color: Colors.black,
  },
});
