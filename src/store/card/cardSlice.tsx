import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TaskItem} from '@utils/Constant';

interface CardState {
  cards: TaskItem[];
}

const initialState: CardState = {
  cards: [],
};

const cardSlice = createSlice({
  name: 'card',
  initialState,
  reducers: {
    setCardList: (state, action: PayloadAction<TaskItem[]>) => {
      state.cards = action.payload;
    },
    addCardList: (state, action: PayloadAction<TaskItem>) => {
      state.cards.push(action.payload);
    },
    updateCardTitle: (
      state,
      action: PayloadAction<{listId: string; cardTitle: string}>,
    ) => {
      const card = state.cards.find(
        card => card.board_id == action.payload.listId,
      );
      if (card) {
        card.title = action.payload.cardTitle;
      }
    },

    updateCardDescription: (
      state,
      action: PayloadAction<{listId: string; cardDescription: string}>,
    ) => {
      const card = state.cards.find(
        card => card.list_id == action.payload.listId,
      );
      if (card) {
        card.description = action.payload.cardDescription;
      }
    },
    deleteCardList: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter(card => card.list_id !== action.payload);
    },
  },
});

export const {
  addCardList,
  deleteCardList,
  setCardList,
  updateCardDescription,
  updateCardTitle,
} = cardSlice.actions;

export default cardSlice.reducer;
