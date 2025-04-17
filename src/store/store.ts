// store/index.ts
import {configureStore} from '@reduxjs/toolkit';
import boardReducer from './board/boardSlice';
import userReducer from './user/userSlice';

const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
