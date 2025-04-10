import {Timestamp} from 'firebase/firestore';
import {useColorScheme} from 'react-native';

export enum DarkColors {
  headerbgcolor = '#2C2C2E',
  secondartgrey = '#1C1C1E',
  primary = '#1465de',
  tabcolor = '#282E33',
  white = '#FFFFFF',
  bglogin = '#2C333A',
}

export enum LightColors {
  primary = '#1465de',
  grey = '#F2F2F2',
  white = '#FFFFFF',
}
export enum Colors {
  lightprimary = '#1465de',
  darkprimary = '#2C333A',
  white = '#FFFFFF',
  black = '#000000',
  textgrey = '#A6A3AF',
  grey = '#F2F2F7',
  placeholdertext = '#8C95A6',
}

export enum Fonts {
  Regular = 'Montserrat-Regular',
  Medium = 'Montserrat-Medium',
  Light = 'Montserrat-Light',
  SemiBold = 'Montserrat-SemiBold',
  Bold = 'Montserrat-Bold',
  Black = 'Montserrat-Black',
  SpaceMono = 'SpaceMono-Regular',
}

export const useGlobalColorScheme = () => {
  const colorScheme = useColorScheme() == 'dark';
  return colorScheme;
};

export enum ModalType {
  Login = 'login',
  SignUp = 'signup',
}

export enum VisibilityType {
  Private = 'private',
  WorkSpace = 'workspace',
  Public = 'public',
}

export interface Board {
  id: string;
  createdBy: string;
  title: string;
  created_at: Timestamp;
  background: string[];
  last_edit: Timestamp | null;
  workspace: string;
}
