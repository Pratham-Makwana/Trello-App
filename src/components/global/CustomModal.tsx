import {Modal, StyleSheet, Text, View} from 'react-native';
import React, {FC, useEffect} from 'react';
import {Colors} from '@utils/Constant';
import {screenWidth} from '@utils/Scaling';
import LottieView from 'lottie-react-native';

interface CustomModalProps {
  loading: boolean;
}

const CustomModal: FC<CustomModalProps> = ({loading}) => {
  return (
    <Modal animationType="slide" transparent visible={loading}>
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          <LottieView
            source={require('@assets/animation/loading.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: Colors.white,
    height: screenWidth * 0.2,
    width: screenWidth * 0.5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: Colors.black,
  },
  lottie: {
    width: 80,
    height: 80,
  },
});
