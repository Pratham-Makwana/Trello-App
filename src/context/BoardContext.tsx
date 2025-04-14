import {DEFAULT_COLOR} from '@features/board/BGSelect';
import {Board} from '@utils/Constant';
import {createContext, useContext, useState} from 'react';

type WorkspaceType = 'Public' | 'Private' | 'Workspace';

interface BoardContextType {
  title: any;
  setTitle: (title: any) => void;
  boardName: string;
  setBoardName: (name: string) => void;
  selectedColor: string[];
  setSelectedColor: (color: string[]) => void;
  selectedWorkSpace: WorkspaceType;
  setSelectedWorkSpace: (workspace: WorkspaceType) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider = ({children}: {children: React.ReactNode}) => {
  const [selectedColor, setSelectedColor] = useState<string[]>(DEFAULT_COLOR);
  const [selectedWorkSpace, setSelectedWorkSpace] =
    useState<WorkspaceType>('Workspace');
  const [boardName, setBoardName] = useState<string>('');
  const [title, setTitle] = useState('');

  const onChangeBoardName = (name: string) => {
    setBoardName(name);
  };

  const onChangeWorkSpace = (workspace: WorkspaceType) => {
    setSelectedWorkSpace(workspace);
  };
  const onChangeSelectedColor = (color: string[]) => {
    setSelectedColor(color);
  };
  const onChangeTitle = (title: string) => {
    setTitle(title);
  };

  return (
    <BoardContext.Provider
      value={{
        selectedColor,
        setSelectedColor: onChangeSelectedColor,
        selectedWorkSpace,
        setSelectedWorkSpace: onChangeWorkSpace,
        boardName,
        setBoardName: onChangeBoardName,
        title,
        setTitle: onChangeTitle,
      }}>
      {children}
    </BoardContext.Provider>
  );
};
