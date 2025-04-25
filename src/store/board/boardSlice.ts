import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Board} from '@utils/Constant';

interface BoardState {
  boards: Board[];
}

const initialState: BoardState = {
  boards: [],
};

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload;
    },
    addBoard: (state, action: PayloadAction<Board>) => {
      state.boards.push(action.payload);
    },
    updateBoardTitle: (
      state,
      action: PayloadAction<{boardId: string; title: string}>,
    ) => {
      const board = state.boards.find(
        b => b.boardId === action.payload.boardId,
      );
      if (board) {
        return {
          ...state,
          boards: state.boards.map(b =>
            b.boardId === action.payload.boardId
              ? {
                  ...b,
                  title: action.payload.title,
                  last_edit: new Date().toISOString(),
                }
              : b,
          ),
        };
      }
    },
    updateBoard: (state, action) => {
      const {boardId} = action.payload;
      const index = state.boards.findIndex(b => b.boardId === boardId);
      if (index !== -1) {
        state.boards[index] = {
          ...state.boards[index],
          ...action.payload,
        };
      }
    },
    closeBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter(b => b.boardId !== action.payload);
    },
  },
});

export const {setBoards, addBoard, closeBoard, updateBoardTitle, updateBoard} =
  boardSlice.actions;

export default boardSlice.reducer;
