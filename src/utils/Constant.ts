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

export const labelColors = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#F5A623',
  '#8E44AD',
];

export interface Board {
  boardId: string;
  createdBy: string;
  title: string;
  created_at: any;
  last_edit: any;
  background: string[];
  workspace: string;
  userInfo?: {
    email: any;
    username: any;
  };
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
  notificationToken?: string;
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
  createdAt: any;

  startDate: any;
  endDate: any;
}

export interface BoardInvite {
  boardId: string;
  invitedBy: string; // user who sent the invite
  invitedTo: string; // user who received the invite
  createdAt: Timestamp;
  status: 'pending' | 'accepted' | 'declined';
}
