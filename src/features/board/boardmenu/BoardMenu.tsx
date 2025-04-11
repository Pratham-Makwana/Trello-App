import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useAuthContext} from '@context/UserContext';
import Icon from '@components/global/Icon';
import {Colors} from '@utils/Constant';
import {screenWidth} from '@utils/Scaling';
import {SvgXml} from 'react-native-svg';

const BoardMenu = () => {
  const {user} = useAuthContext();

  // const avatarUrl = 'https://ui-avatars.com/api/?name=test&format=png';
  const avatarUrl = 'https://ui-avatars.com/api/?name=test';
  return (
    <View style={styles.mainContainer}>
      <View style={styles.memeberContainer}>
        <View style={styles.memeberContent}>
          <Icon
            name="person-outline"
            iconFamily="MaterialIcons"
            size={24}
            color={Colors.darkprimary}
          />
          <Text style={styles.text}>Memebers</Text>
        </View>
      </View>
      <View style={styles.subContainer}>
        <View style={styles.imageContainer}>
          <SvgXml xml={avatarUrl} width={40} height={40} />
          <Image
            source={{uri: user?.photoURL}}
            style={styles.image}
            resizeMode="cover"
            onError={e => {
              console.log('Image load error:', e.nativeEvent.error);
            }}
          />
        </View>
        <Text style={styles.text}>{user?.displayName}</Text>
      </View>
    </View>
  );
};

export default BoardMenu;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#fff',
    marginVertical: 50,
    height: screenWidth * 0.25,
  },
  memeberContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.textgrey,
    paddingBottom: 5,
    paddingTop: 5,
    paddingHorizontal: 15,
  },
  memeberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.black,
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    marginTop: 10,
  },
  imageContainer: {
    height: 40,
    width: 40,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
    borderRadius: 50,
  },
});
