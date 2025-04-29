import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from '@utils/Constant';

interface MembersState {
  members: User[];
}

const initialState: MembersState = {
  members: [],
};

const memeberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<User[]>) => {
      state.members = action.payload;
    },
  },
});

export const {setMembers} = memeberSlice.actions;

export default memeberSlice.reducer;
