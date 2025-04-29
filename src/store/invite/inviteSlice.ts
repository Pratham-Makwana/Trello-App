import { Invite } from '@features/invite/InviteScreen';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';


type InviteState = {
  pendingInvites: Invite[];
};

const initialState: InviteState = {
  pendingInvites: [],
};

const inviteSlice = createSlice({
  name: 'invite',
  initialState,
  reducers: {
    setPendingInvites(state, action: PayloadAction<Invite[]>) {
      state.pendingInvites = action.payload;
    },
  },
});

export const {setPendingInvites} = inviteSlice.actions;
export default inviteSlice.reducer;
