// store/index.ts
import {configureStore} from '@reduxjs/toolkit';
import boardReducer from './board/boardSlice';
import userReducer from './user/userSlice';
import cardReducer from './card/cardSlice';

const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
    card: cardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
