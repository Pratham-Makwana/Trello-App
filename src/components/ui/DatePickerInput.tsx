import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {format} from 'date-fns';
import Icon from '@components/global/Icon';
import {Colors} from '@utils/Constant';

interface DatePickerInputProps {
  title: string;
  date: Date | null;
  onDateChange: (date: Date) => void;
  onRemove: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isStartDate: boolean;
  disable: boolean;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  title,
  date,
  onDateChange,
  onRemove,
  open,
  setOpen,
  isStartDate,
  disable,
}) => {
  return (
    <View>
      <TouchableOpacity
        disabled={disable}
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginBottom: 16,
        }}
        onPress={() => setOpen(true)}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}>
            <Text
              style={{
                color: Colors.fontDark,
                fontSize: 12,
                marginBottom: 5,
              }}>
              {title}
            </Text>
            <Text
              style={{
                color: Colors.fontDark,
                fontSize: 12,
                marginBottom: 5,
              }}>
              {!date ? 'Date Not Selected' : format(date, 'dd MMM yyyy')}
            </Text>
          </View>
          {date && (
            <TouchableOpacity
              style={{
                backgroundColor: 'pink',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5,
              }}
              onPress={onRemove}>
              <Icon
                name="remove"
                size={22}
                iconFamily="Ionicons"
                color={'red'}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <DatePicker
        title={`Select ${title}`}
        mode="date"
        modal
        open={open}
        date={date || new Date()}
        onConfirm={onDateChange}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
};

export default DatePickerInput;
