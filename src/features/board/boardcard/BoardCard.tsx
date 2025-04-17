import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {Board} from '@utils/Constant';
import CustomHeaderIOS from '@components/global/CustomHeaderIOS';
import CustomHeaderAndroid from '@components/global/CustomHeaderAndroid';
import {getBoardInfo, listenToUpdateBoardInfo} from '@config/firebase';
import LinearGradient from 'react-native-linear-gradient';
import BoardCardArea from './BoardCardArea';
import CustomModal from '@components/global/CustomModal';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {updateBoardTitle} from '@store/board/boardSlice';

const BoardCard = () => {
  const route = useRoute();
  const {boardDetails} = route.params as {boardDetails: Board};
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState<Board | any>();
  const {user} = useUser();
  const dispatch = useAppDispatch();

  const currentBoard = useAppSelector(state =>
    state.board.boards.find(b => b.boardId === boardDetails.boardId),
  );

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(
      boardDetails.boardId,
      updatedBoard => {
        dispatch(
          updateBoardTitle({
            boardId: updatedBoard.boardId,
            title: updatedBoard.title,
          }),
        );
      },
    );

    return () => unsubscribe();
  }, []);
  const gradientColors =
    boardDetails?.background.length === 1
      ? [boardDetails?.background[0], boardDetails?.background[0]]
      : boardDetails?.background;

  useEffect(() => {
    loadBoardInfo();
  }, []);

  const loadBoardInfo = async () => {
    setLoading(true);
    const data = await getBoardInfo(boardDetails?.boardId, user!.uid);
    console.log('==> boardInfo', data);

    setBoard(data);
    setLoading(false);
  };
  return (
    <LinearGradient colors={gradientColors} style={{flex: 1}}>
      {Platform.OS === 'ios' && (
        <CustomHeaderIOS title={boardDetails.title} board={board} />
      )}
      {Platform.OS === 'android' && (
        <CustomHeaderAndroid
          title={currentBoard?.title || 'Untitled'}
          board={board}
        />
      )}
      {loading && <CustomModal loading={loading} />}
      {board && <BoardCardArea board={board} />}
    </LinearGradient>
  );
};

export default BoardCard;

const styles = StyleSheet.create({});
