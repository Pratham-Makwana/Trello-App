import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC} from 'react';
import {Colors} from '@utils/Constant';
import Icon from '@components/global/Icon';

type MoveListProps = {
  item: any;
  onSelectList: (list: any) => void;
  isSelected: boolean;
};

const MoveList: FC<MoveListProps> = ({item, onSelectList, isSelected}) => {
  return (
    <TouchableOpacity
      style={[
        styles.listContainer,
        {backgroundColor: isSelected ? '#eee' : '#fff'},
      ]}
      onPress={() => onSelectList(item)}>
      <View style={styles.row}>
        <Text style={styles.titleText}>{item?.title}</Text>
        {isSelected && (
          <Icon
            name="checkmark"
            iconFamily="Ionicons"
            size={18}
            color={Colors.lightprimary}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MoveList;

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: Colors.textgrey,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    color: Colors.black,
    fontSize: 16,
  },
});
