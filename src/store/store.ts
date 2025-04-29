// store/index.ts
import {configureStore} from '@reduxjs/toolkit';
import boardReducer from './board/boardSlice';
import userReducer from './user/userSlice';
import cardReducer from './card/cardSlice';
import inviteReducer from './invite/inviteSlice';
import notificationReducer from './notification/notificationSlice';

const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
    card: cardReducer,
    invite: inviteReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
