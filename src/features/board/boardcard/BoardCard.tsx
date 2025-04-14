import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useRoute} from '@react-navigation/native';
import {Board} from '@utils/Constant';
import CustomHeaderIOS from '@components/global/CustomHeaderIOS';
import CustomHeaderAndroid from '@components/global/CustomHeaderAndroid';
import {getBoardInfo} from '@config/firebase';
import {useAuthContext} from '@context/UserContext';
import LinearGradient from 'react-native-linear-gradient';
import BoardCardArea from './BoardCardArea';
import CustomModal from '@components/global/CustomModal';

const BoardCard = () => {
  const route = useRoute();
  const {boardDetails} = route.params as {boardDetails: Board};
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState<Board | any>();
  const {user} = useAuthContext();
  const isFocused = useIsFocused();

  const gradientColors =
    boardDetails?.background.length === 1
      ? [boardDetails?.background[0], boardDetails?.background[0]]
      : boardDetails?.background;

  useEffect(() => {
    if (!boardDetails.id) return;
    loadBoardInfo();
  }, [boardDetails.id]);

  const loadBoardInfo = async () => {
    setLoading(true);
    if (!boardDetails.id) return;
    const data = await getBoardInfo(boardDetails.id, user?.uid);
    setBoard(data);
    setLoading(false);
  };
  return (
    <LinearGradient colors={gradientColors} style={{flex: 1}}>
      {Platform.OS === 'ios' && (
        <CustomHeaderIOS
          title={boardDetails.title}
          board={board}
          boardId={boardDetails?.boardId}
        />
      )}
      {Platform.OS === 'android' && (
        <CustomHeaderAndroid
          title={boardDetails.title}
          board={board}
          boardId={boardDetails?.boardId}
        />
      )}
      {loading && <CustomModal loading={isFocused && loading} />}
      {board && <BoardCardArea board={board} />}
    </LinearGradient>
  );
};

export default BoardCard;

const styles = StyleSheet.create({});
