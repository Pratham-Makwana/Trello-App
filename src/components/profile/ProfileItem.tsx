import Icon from '@components/global/Icon';
import {Text, View, TouchableOpacity, StyleSheet} from 'react-native';

const ProfileItem = ({
  label,
  value,
  showModal,
  valueStyle,
}: {
  label: string;
  value: string;
  showModal?: () => void;
  valueStyle?: object;
}) => (
  <View style={styles.itemRow}>
    <Text style={styles.itemLabel}>{label}</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
      <Text style={[styles.itemValue, valueStyle]}>{value || '—'}</Text>
      {label === 'Username' && (
        <TouchableOpacity onPress={showModal}>
          <Icon
            name="edit"
            size={20}
            color="#007bff"
            iconFamily="MaterialIcons"
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default ProfileItem;

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  itemLabel: {
    fontWeight: '500',
    color: '#333',
  },
  itemValue: {
    color: '#555',
  },
});
