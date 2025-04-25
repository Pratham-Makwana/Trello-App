import React, {FC} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from './Icon';
import {Board, Colors} from '@utils/Constant';
import {goBack, navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {leaveBoard} from '@config/firebaseRN';
import {closeBoard} from '@store/board/boardSlice';

interface CustomHeaderIOSProps {
  title: string;
  board?: Board;
  boardId: string;
}
const CustomHeaderIOS: FC<CustomHeaderIOSProps> = ({title, board, boardId}) => {
  const {user} = useUser();
  const currentBoard = useAppSelector(state =>
    state.board.boards.find(b => b.boardId === boardId),
  );
  const dispatch = useAppDispatch();

  const onLeaveBoard = async () => {
    leaveBoard(boardId, user!.uid);
    dispatch(closeBoard(boardId));
    resetAndNavigate('UserBottomTab');
  };
  const {top} = useSafeAreaInsets();

  return (
    <View style={[styles.blurContainer, {paddingTop: top}]}>
      {/*
             BlurView is supported on both iOS and Android.
             If you also need to support Android, the BlurView must be
             absolutely positioned behind your unblurred views, and it
             cannot contain any child views.
           */}
      <BlurView blurType={'dark'} blurAmount={60} style={[styles.blurView]} />
      <View style={styles.mainContainer}>
        <View style={styles.icon}>
          <TouchableOpacity activeOpacity={0.8} onPress={goBack}>
            <Icon
              name="close"
              iconFamily="Ionicons"
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.text}>
              {currentBoard?.userInfo?.username || 'Person'}'s Workspace
            </Text>
          </View>
        </View>
        {/* Icons  */}
        <View style={[styles.rowIconContainer]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (
                currentBoard?.workspace == 'Private' &&
                currentBoard?.role == 'member'
              ) {
                Alert.alert('Are you sure want to leave this board?', '', [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: () => {
                      onLeaveBoard();
                    },
                  },
                ]);
                return;
              }
              navigate(
                'BoardMenu',
                {boardId: boardId},
                // {boardId: board?.boardId}
              );
            }}>
            {currentBoard?.workspace == 'Private' &&
            currentBoard?.role == 'member' ? (
              <Icon
                name="log-out-outline"
                iconFamily="Ionicons"
                size={26}
                color={Colors.black}
              />
            ) : (
              <Icon
                name="dots-horizontal"
                iconFamily="MaterialCommunityIcons"
                size={26}
                color={Colors.black}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  mainContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingBottom: 5,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // justifyContent: 'space-around',
  },
  icon: {
    gap: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    gap: 3,
    justifyContent: 'center',
  },
  rowIconContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  text: {
    fontSize: 12,
    // paddingBottom: 5,
    color: 'white',
  },
});

export default CustomHeaderIOS;
