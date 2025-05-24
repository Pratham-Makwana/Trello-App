import LinearGradient from 'react-native-linear-gradient';
import Icon from '@components/global/Icon';
import FilterButton from '@components/global/FilterButton';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Board, Colors} from '@utils/Constant';
import {navigate} from '@utils/NavigationUtils';
import {useUser} from '@hooks/useUser';
import {useAppDispatch, useAppSelector} from '@store/reduxHook';
import {setBoards} from '@store/board/boardSlice';
import {
  listenToCurrentUserInfo,
  listenToUserBoards,
  updateUserBoardPositions,
} from '@config/firebaseRN';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {createBackdropRenderer} from '@components/global/CreateBackdropRenderer';
import {runOnJS} from 'react-native-reanimated';
import {RFValue} from 'react-native-responsive-fontsize';
import {useFilter} from '@context/FilterContext';
import {useFocusEffect} from '@react-navigation/native';
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import {
  hasActivePremiumSubscription,
  isSubscriptionExpired,
  updateIsPremiumStatus,
} from '@utils/subscription/SubscriptionUtils';

const BoardScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {user, setUser} = useUser();
  const boards = useAppSelector(state => state.board.boards);
  const dispatch = useAppDispatch();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [selectedBoardFilter, setSelectedBoardFilter] = useState<
    string | undefined
  >();
  const [activeFilter, setActiveFilter] = useState<
    'owner' | 'member' | undefined
  >(undefined);
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const {setFilters} = useFilter();
  const snapPoints = useMemo(() => ['30%'], []);
  const onCancleModal = () => {
    setSelectedBoardFilter('');
    setActiveFilter(undefined);
    runOnJS(() => bottomSheetModalRef.current?.close())();
  };

  const showModal = () => {
    bottomSheetModalRef.current?.present();
  };
  const renderBackdrop = useMemo(
    () => createBackdropRenderer(onCancleModal),
    [onCancleModal],
  );

  const onApplyFilter = () => {
    let filterType: 'owner' | 'member' | undefined = undefined;
    if (selectedBoardFilter === 'Owned Boards') filterType = 'owner';
    else if (selectedBoardFilter === 'Joined Boards') filterType = 'member';

    setActiveFilter(filterType);
    bottomSheetModalRef.current?.close();
  };

  const isPremiumUser = user ? hasActivePremiumSubscription(user) : false;

  useEffect(() => {
    if (!isLocalUpdate) {
      setIsLoading(true);
      const unsubscribe = listenToUserBoards(
        user!.uid,
        activeFilter,
        boards => {
          dispatch(setBoards(boards));
          setIsLoading(false);
        },
      );

      return () => unsubscribe();
    }

    return () => {
      if (isLocalUpdate) {
        setIsLocalUpdate(false);
      }
    };
  }, [activeFilter, isLocalUpdate, user]);

  useEffect(() => {
    const unsubscribe = listenToCurrentUserInfo(
      async updatedUser => {
        setUser(updatedUser);

        const subscription = updatedUser.subscription;
        if (!subscription || !subscription.isPremium) return;

        if (
          updatedUser.subscription?.isPremium &&
          isSubscriptionExpired(updatedUser?.subscription?.expiryDate)
        ) {
          await updateIsPremiumStatus(updatedUser.uid);
        }
      },
      error => {
        console.log('Realtime user subscription error:', error);
      },
    );

    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFilters({
        assignedUserId: null,
        dueDate: null,
        status: null,
      });
    }, []),
  );

  const onBoardDrop = async (params: DragEndParams<Board>) => {
    setIsLocalUpdate(true);

    const newBoardsData = params.data.map((item: Board, index: number) => ({
      ...item,
      position: index + 1,
    }));

    dispatch(setBoards(newBoardsData));

    if (user?.uid) {
      try {
        await updateUserBoardPositions(user.uid, newBoardsData);
      } catch (error) {
        console.error('Error updating board positions:', error);
        setIsLocalUpdate(false);
      }
    }
  };

  const BoardsListItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Board> & {isPremiumUser: boolean}) => {
    const gradientColors =
      item.background.length === 1
        ? [item.background[0], item.background[0]]
        : item.background;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={isPremiumUser ? drag : undefined}
          disabled={isActive}
          style={[styles.boardList]}
          activeOpacity={0.8}
          onPress={() =>
            navigate('BoardCard', {boardDetails: item, boardId: item.boardId})
          }>
          {isPremiumUser && (
            <TouchableOpacity onLongPress={drag} disabled={isActive}>
              <Icon
                name="reorder-four"
                iconFamily="Ionicons"
                size={22}
                color={Colors.fontDark}
              />
            </TouchableOpacity>
          )}
          <LinearGradient colors={gradientColors} style={styles.colorBlock} />
          <Text style={styles.titleText}>{item.title}</Text>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.listHeader}>
        <Text style={styles.titleHeaderText}>YOUR WORKSPACES</Text>
      </View>
      <View style={styles.workspaceContent}>
        <View style={styles.rowCenterGap}>
          <Icon
            name="person-outline"
            iconFamily="MaterialIcons"
            size={24}
            color={Colors.darkprimary}
          />
          <Text style={styles.userTitle}>{user?.username}'s workspace</Text>
        </View>
        <TouchableOpacity style={styles.filterContainer} onPress={showModal}>
          {activeFilter && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: Colors.lightprimary,
                borderRadius: 8,
                paddingHorizontal: 4,
                minWidth: 8,
                height: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}
          <Icon
            name="filter-circle-outline"
            iconFamily="Ionicons"
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <StatusBar backgroundColor={Colors.lightprimary} />
        <ActivityIndicator size="large" color={Colors.lightprimary} />
      </View>
    );
  }

  return (
    <View style={styles.boardContainer}>
      <StatusBar backgroundColor={Colors.lightprimary} />

      <DraggableFlatList
        contentContainerStyle={
          boards && boards.length > 0 ? styles.list : undefined
        }
        data={boards}
        renderItem={params => (
          <BoardsListItem {...params} isPremiumUser={isPremiumUser} />
        )}
        onDragEnd={onBoardDrop}
        keyExtractor={item => item.boardId}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No boards yet. Tap the + button to create one!
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.grey,
              marginStart: 50,
            }}
          />
        )}
      />
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleStyle={{
          borderRadius: 12,
        }}
        enableOverDrag={false}
        enablePanDownToClose>
        <BottomSheetView style={{flex: 1, paddingHorizontal: 20}}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
            <FilterButton
              onPress={() => {
                setSelectedBoardFilter('');
                bottomSheetModalRef.current?.close();
                setActiveFilter(undefined);
              }}
              label="Clear Filter"
            />
            <FilterButton onPress={onApplyFilter} label="Apply" />
          </View>

          <Text style={styles.sectionTitle}>Filter Boards</Text>
          <View style={styles.row}>
            {['Owned Boards', 'Joined Boards'].map(label => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.chip,
                  selectedBoardFilter === label && styles.chipSelected,
                ]}
                onPress={() => {
                  setSelectedBoardFilter(label);
                }}>
                <Text
                  style={[
                    styles.chipText,
                    selectedBoardFilter === label && styles.chipTextSelected,
                  ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  boardContainer: {
    flex: 1,
    marginVertical: 50,
    backgroundColor: Colors.grey,
  },
  boardList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderColor: Colors.textgrey,
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  list: {
    borderColor: Colors.grey,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorBlock: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  titleText: {
    fontSize: 16,
    color: Colors.black,
  },
  listHeader: {
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  titleHeaderText: {
    color: Colors.darkprimary,
    fontSize: 16,
    fontWeight: '600',
  },
  workspaceContent: {
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rowCenterGap: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  userTitle: {
    color: Colors.darkprimary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: Colors.darkprimary,
    fontSize: 16,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.darkprimary,
    fontWeight: 'bold',
    fontSize: RFValue(16),
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F0F4FA',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0d8e0',
  },

  chipSelected: {
    backgroundColor: '#1465de',
    borderColor: '#1465de',
  },

  chipText: {
    color: '#333',
    fontSize: 14,
  },

  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
