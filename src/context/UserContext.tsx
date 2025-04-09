// import {getCurrentUser} from '@config/firebase';
// import {authStorage} from '@state/storage';
import {createContext, useContext, useEffect, useState} from 'react';

interface authStore {
  user: Record<string, any> | null;
  setUser: (user: any) => void;
  logout: () => void;
  isLoading?: boolean;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<authStore | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('AuthContext must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);
  const [isLoading, setLoading] = useState(false);

  const logout = () => {
    setUser(null);
  };
  // //  getCurrentLoggedInUser From the storage
  // const getCurrentLoggedInUser = async () => {
  //   try {
  //     // const authUserString = authStorage.getString('authUser');
  //     // const currentUser = authUserString ? JSON.parse(authUserString) : null;
  //     // console.log('==> AuthProvider:getCurrentLoggedInUser: ', currentUser);

  //     // setUser(currentUser);
  //   } catch (error) {
  //     console.log('Error getting current user:', error);
  //   }
  // };
  // useEffect(() => {
  //   getCurrentLoggedInUser();
  // }, []);

  return (
    <AuthContext.Provider
      value={{user, setUser, logout, isLoading, setLoading}}>
      {children}
    </AuthContext.Provider>
  );
};
