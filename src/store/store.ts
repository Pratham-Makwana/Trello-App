import {configureStore} from '@reduxjs/toolkit';
import boardReducer from './board/boardSlice';
import userReducer from './user/userSlice';
import inviteReducer from './invite/inviteSlice';
import notificationReducer from './notification/notificationSlice';
import memberReducer from './member/memberSlice';
const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
    invite: inviteReducer,
    notification: notificationReducer,
    member: memberReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
