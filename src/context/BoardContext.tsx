import {DEFAULT_COLOR} from '@features/board/BGSelect';
import {createContext, useContext, useState, ReactNode} from 'react';

type WorkspaceType = 'Public' | 'Private' | 'Workspace';

interface BoardContextType {
  title: string;
  setTitle: (title: string) => void;
  boardName: string;
  setBoardName: (name: string) => void;
  selectedColor: string[];
  setSelectedColor: (color: string[]) => void;
  selectedWorkSpace: WorkspaceType;
  setSelectedWorkSpace: (workspace: WorkspaceType) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider = ({children}: {children: ReactNode}) => {
  const [title, setTitle] = useState<string>('');
  const [boardName, setBoardName] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string[]>(DEFAULT_COLOR);
  const [selectedWorkSpace, setSelectedWorkSpace] = useState<WorkspaceType>('Workspace');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <BoardContext.Provider
      value={{
        title,
        setTitle,
        boardName,
        setBoardName,
        selectedColor,
        setSelectedColor,
        selectedWorkSpace,
        setSelectedWorkSpace,
        loading,
        setLoading,
      }}>
      {children}
    </BoardContext.Provider>
  );
};
