import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  hasCompletedWelcome: boolean;
  completeWelcome: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userName, setUserNameState] = useState('');
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);

  useEffect(() => {
    // Load user data from localStorage on mount
    const savedName = localStorage.getItem('userName');
    const completedWelcome = localStorage.getItem('completedWelcome') === 'true';
    
    if (savedName) {
      setUserNameState(savedName);
    }
    
    setHasCompletedWelcome(completedWelcome && !!savedName);
  }, []);

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
  };

  const completeWelcome = (name: string) => {
    setUserName(name);
    setHasCompletedWelcome(true);
    localStorage.setItem('completedWelcome', 'true');
  };

  return (
    <UserContext.Provider value={{
      userName,
      setUserName,
      hasCompletedWelcome,
      completeWelcome,
    }}>
      {children}
    </UserContext.Provider>
  );
};