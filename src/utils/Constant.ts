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
  fontDark = '#292929',
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
  boardId: string;
  createdBy: string;
  title: string;
  created_at: Timestamp;
  background: string[];
  last_edit: Timestamp | null;
  workspace: string;
}

export interface TaskList {
  list_id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: Date;
  last_edit: Date;
}

export interface FakeTaskList {
  list_id?: string;
}
export interface User {
  uid: string;
  email: string;
  username: string;
  photoURL: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  done: boolean;
  imageUrl: string | null;
  position: number;
  board_id: string;
  list_id: string;
  createdAt: Date;
  index?: number;
}
