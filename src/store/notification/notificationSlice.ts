import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: [],
};
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'read'>>,
    ) => {
      state.notifications.unshift({...action.payload, read: false});
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },
    markAllAsRead: state => {
      state.notifications = state.notifications.map(n => ({...n, read: true}));
    },
  },
});

export const {addNotification, markAllAsRead, setNotifications} =
  notificationSlice.actions;

export default notificationSlice.reducer;
