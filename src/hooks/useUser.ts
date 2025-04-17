import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {logOut, setUser, User} from '@store/user/userSlice';

export const useUser = () => {
  const user = useAppSelector(state => state.user.currentUser);
  const dispatch = useAppDispatch();

  return {
    user,
    setUser: (userData: User) => dispatch(setUser(userData)),
    logout: () => dispatch(logOut()),
  };
};
