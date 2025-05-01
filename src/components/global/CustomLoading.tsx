import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {FC} from 'react';
import {Colors} from '@utils/Constant';

interface CustomLoadingProps {
  transparent?: boolean;
}
const CustomLoading: FC<CustomLoadingProps> = ({transparent = true}) => {
  return (
    <View
      style={[
        styles.overlay,
        {backgroundColor: transparent ? 'rgba(0, 0, 0, 0.4)' : undefined},
      ]}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.lightprimary} />
      </View>
    </View>
  );
};

export default CustomLoading;

const styles = StyleSheet.create({
  overlay: {
    flexGrow: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loaderContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
