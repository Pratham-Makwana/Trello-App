import {MMKV} from 'react-native-mmkv';

export const authStorage = new MMKV({
  id: 'authUser',
  encryptionKey: 'some_secret_key',
});
