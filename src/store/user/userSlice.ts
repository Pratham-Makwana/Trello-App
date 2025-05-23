import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';

export interface User {
  uid: string;
  username: string | null;
  email: string | null;
  photoURL: string | null;
}
interface UserState {
  currentUser: User | null;
}

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    logOut: state => {
      state.currentUser = null;
    },
  },
});

export const {logOut, setUser} = userSlice.actions;
export const selectUser = (state: RootState) => state.user.currentUser;
export default userSlice.reducer;
