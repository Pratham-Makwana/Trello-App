import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomSearchBar from './CustomSearchBar';
import UserList from './UserList';
import LottieView from 'lottie-react-native';
import notFound from '@assets/animation/notfound.json';
import {screenWidth} from '@utils/Scaling';
import {RouteProp, useRoute} from '@react-navigation/native';
import {goBack, navigate} from '@utils/NavigationUtils';
import {Colors, User} from '@utils/Constant';
import Toast from 'react-native-toast-message';
import {sendNotificationToOtherUser} from '@config/firebaseNotification';
import {useAppSelector} from '@store/reduxHook';
import {
  findUsers,
  listenToBoardMembers,
  sendBoardInvite,
} from '@config/firebaseRN';
import Icon from '@components/global/Icon';
import {Timestamp} from '@react-native-firebase/firestore';
import {isSubscriptionExpired} from '@utils/subscription/SubscriptionUtils';
import CustomLoading from '@components/global/CustomLoading';

// Constants for membership limits
export const FREE_MEMBER_LIMIT = 3;
export const PREMIUM_MEMBER_LIMIT = 10;

const Invite = () => {
  const route =
    useRoute<RouteProp<{Invite: {boardId: string; title: string}}>>();
  const {boardId, title} = route.params;
  const currentUser = useAppSelector(state => state.user.currentUser);
  const currentBoard = useAppSelector(state =>
    state.board.boards.find(board => board.boardId === boardId),
  );
  const boardMembers = useAppSelector(state => state.member.members);
  const [search, setSearch] = useState('');

  const [isSearch, setIsSearch] = useState(false);
  const [searchUser, setSearchUser] = useState<any>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [memberCount, setMemberCount] = useState(boardMembers.length || 0);
  const [isLoading, setIsLoading] = useState(false);
  const Creator = boardMembers.find(member => member.role === 'creator');

  const canCreatorInvite = (
    creator: User,
    currentMemberCount: number,
  ): boolean => {
    const subscription = creator.subscription;

    let expiryDateStr: string | undefined;

    if (typeof subscription?.expiryDate === 'string') {
      expiryDateStr = subscription.expiryDate;
    } else if (
      subscription?.expiryDate &&
      typeof (subscription.expiryDate as Timestamp).toDate === 'function'
    ) {
      expiryDateStr = (subscription.expiryDate as Timestamp)
        .toDate()
        .toISOString();
    }

    const isExpired = isSubscriptionExpired(expiryDateStr);

    const isPremium = subscription?.isPremium === true && !isExpired;

    const memberLimit = isPremium ? PREMIUM_MEMBER_LIMIT : FREE_MEMBER_LIMIT;

    return currentMemberCount < memberLimit;
  };

  const onClear = () => {
    setSearch('');
    setSearchUser([]);
  };

  useEffect(() => {
    const unsubscribe = listenToBoardMembers(boardId, members => {
      setMemberCount(members.length);
    });

    return () => unsubscribe();
  }, [boardId]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.trim()) {
        const users = await findUsers(search.trim());
        setSearchUser(users);
      } else {
        setSearchUser([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleUpgradeSubscription = () => {
    setShowUpgradeModal(false);

    navigate('SubscriptionScreen', {returnTo: 'Invite', boardId, title});
  };

  const onAddUser = async (user: User) => {
    try {
      const canInvite = Creator
        ? canCreatorInvite(Creator, memberCount)
        : false;

      if (!canInvite) {
        setShowUpgradeModal(true);
        return;
      }
      setIsLoading(true);

      if (user?.uid) {
        const response = await sendNotificationToOtherUser(
          user?.uid,
          '📩 Board Invitation',
          `you've been invited to collaborate on a ${title} board. Tap to join and start working together!`,
          'invite',
        );
        if (response) {
          setIsLoading(false);
          Toast.show({
            type: 'success',
            text1: 'Invitation Sent 🎉',
            text2: `Your invitation to join the "${title}" board has been sent.`,
          });
          await sendBoardInvite(
            boardId,
            user?.uid,
            currentUser!.uid,
            currentBoard?.workspace,
          );
          setTimeout(() => {
            goBack();
          }, 300);
        } else {
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Something went wrong, please try later',
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.log('Error On Add User', error);
    }
  };

  // Upgrade Modal component
  const UpgradeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showUpgradeModal}
      onRequestClose={() => setShowUpgradeModal(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Icon
              name="crown"
              iconFamily="MaterialCommunityIcons"
              size={24}
              color={Colors.lightprimary}
            />
            <Text style={styles.modalTitle}>Upgrade to Premium</Text>
          </View>

          <Text style={styles.modalText}>
            You've reached the member limit ({FREE_MEMBER_LIMIT}) for free
            boards.
          </Text>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
            <View style={styles.benefitRow}>
              <Icon
                name="check-circle-outline"
                iconFamily="MaterialCommunityIcons"
                size={16}
                color={Colors.lightprimary}
              />
              <Text style={styles.benefitText}>
                Up to {PREMIUM_MEMBER_LIMIT} members per board
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon
                name="check-circle-outline"
                iconFamily="MaterialCommunityIcons"
                size={16}
                color={Colors.lightprimary}
              />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
            <View style={styles.benefitRow}>
              <Icon
                name="check-circle-outline"
                iconFamily="MaterialCommunityIcons"
                size={16}
                color={Colors.lightprimary}
              />
              <Text style={styles.benefitText}>Advanced board features</Text>
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowUpgradeModal(false)}>
              <Text style={styles.cancelButtonText}>Not Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeSubscription}>
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {isLoading && <CustomLoading />}
      <CustomSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="search user by email"
        onClear={onClear}
      />

      <View style={{paddingHorizontal: 20, flex: 1}}>
        <FlatList
          data={searchUser}
          keyExtractor={item => item.uid}
          renderItem={({item}) => (
            <UserList member={item} onPress={onAddUser} addUser={true} />
          )}
          contentContainerStyle={{gap: 8}}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <LottieView
                source={notFound}
                loop
                autoPlay
                style={{width: screenWidth * 0.5, height: screenWidth}}
              />
            </View>
          )}
          style={{marginVertical: 12}}
        />
      </View>
      <UpgradeModal />
    </>
  );
};

export default Invite;

const styles = StyleSheet.create({
  memberCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  memberCountText: {
    fontSize: 14,
    color: Colors.fontDark,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.fontDark,
    marginLeft: 10,
  },
  modalText: {
    fontSize: 16,
    color: Colors.fontDark,
    textAlign: 'center',
    marginBottom: 15,
  },
  benefitsContainer: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.fontDark,
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.fontDark,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.lightprimary,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.lightprimary,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: Colors.lightprimary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
