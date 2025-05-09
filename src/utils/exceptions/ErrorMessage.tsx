import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({message}) => {
  if (!message) return null;

  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: '#FFE5E5',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: RFValue(12),
    fontWeight: '500',
  },
});

export default ErrorMessage;
