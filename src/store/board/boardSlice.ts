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
        (board.title = action.payload.title),
          (board.last_edit = new Date().toISOString());
      }
    },
    updateBoardUserInfo: (
      state,
      action: PayloadAction<{ boardId: string; userInfo: { username: string; email: string } }>
    ) => {
      const board = state.boards.find(b => b.boardId === action.payload.boardId);
      if (board) {
        board.userInfo = action.payload.userInfo;
      }
    },
    closeBoard: (state, action: PayloadAction<string>) => {
      state.boards = state.boards.filter(b => b.boardId !== action.payload);
    },
  },
});

export const {setBoards, addBoard, closeBoard, updateBoardTitle} =
  boardSlice.actions;

export default boardSlice.reducer;
