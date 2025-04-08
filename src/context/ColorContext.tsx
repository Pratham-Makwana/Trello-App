import {DEFAULT_COLOR} from '@features/board/BGSelect';
import {createContext, useContext, useState} from 'react';

interface ColorContextType {
  bgColor: string[];
  setSelectedColor: (color: string[]) => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useColor = () => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColor must be used within a ColorProvider');
  }
  return context;
};

export const ColorProvider = ({children}: {children: React.ReactNode}) => {
  const [bgColor, setBgColor] = useState<string[]>(DEFAULT_COLOR);

  const setSelectedColor = (color: string[]) => {
    setBgColor(color);
  };
  return (
    <ColorContext.Provider value={{bgColor, setSelectedColor}}>
      {children}
    </ColorContext.Provider>
  );
};
