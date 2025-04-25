import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {Board} from '@utils/Constant';
import CustomHeaderIOS from '@components/global/CustomHeaderIOS';
import CustomHeaderAndroid from '@components/global/CustomHeaderAndroid';
// import {getBoardInfo, listenToUpdateBoardInfo} from '@config/firebase';
import LinearGradient from 'react-native-linear-gradient';
import BoardCardArea from './BoardCardArea';
import CustomModal from '@components/global/CustomModal';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {updateBoard, updateBoardTitle} from '@store/board/boardSlice';
import {goBack, resetAndNavigate} from '@utils/NavigationUtils';
import {getBoardInfo, listenToUpdateBoardInfo} from '@config/firebaseRN';

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
    if (!currentBoard) resetAndNavigate('UserBottomTab');
  }, [currentBoard]);

  useEffect(() => {
    const unsubscribe = listenToUpdateBoardInfo(
      boardDetails.boardId,
      user!.uid,
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
    dispatch(updateBoard(data));
    setBoard(data);
    setLoading(false);
  };
  return (
    <LinearGradient colors={gradientColors} style={{flex: 1}}>
      {Platform.OS === 'ios' && (
        <CustomHeaderIOS
          title={currentBoard!.title}
          // board={board}
          boardId={currentBoard?.boardId || ''}
        />
      )}
      {Platform.OS === 'android' && (
        <CustomHeaderAndroid
          title={currentBoard?.title || 'Untitled'}
          // board={board}
          boardId={currentBoard?.boardId || ''}
        />
      )}
      {loading && <CustomModal loading={loading} />}
      {board && <BoardCardArea key={board?.board_id} board={board} />}
    </LinearGradient>
  );
};

export default BoardCard;

const styles = StyleSheet.create({});
