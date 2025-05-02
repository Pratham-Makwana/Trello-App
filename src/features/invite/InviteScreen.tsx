import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import {useAppSelector} from '@store/reduxHook';
import {Colors} from '@utils/Constant';
import {sendNotificationToOtherUser} from '@config/firebaseNotification';
import {
  acceptInvite,
  declineInvite,
} from '@config/firebaseRN';
import Toast from 'react-native-toast-message';

export type Invite = {
  id: string;
  boardId: string;
  boardName: string;
  invitedBy: string;
  invitedTo: string;
  status: 'pending' | 'accepted' | 'rejected';

  invitedByUserInfo: {
    uid: string;
    username: string;
    email: string;
    photoURL: string;
    notificationToken: string;
  };
};

const InviteScreen = () => {
  const [loading, setLoading] = useState(false);
  const currentUser = useAppSelector(state => state.user.currentUser);
  const invites = useAppSelector(state => state.invite.pendingInvites);

  const handleAccept = async (invite: Invite) => {
    try {
      Toast.show({
        type: 'success',
        text1: 'Invitation Accepted',
        text2: `You can now access the board "${invite.boardName}" in the Boards screen.`,
      });

      await acceptInvite(invite.id, invite.boardId, currentUser!.uid);

      if (invite.invitedBy) {
        sendNotificationToOtherUser(
          invite.invitedBy,
          'Invite Accepted',
          `${currentUser?.username} has accepted your invitation to join the board "${invite.boardName}"`,
        );
      }
    } catch (err) {
      console.error('Error accepting invite:', err);
    }
  };

  const handleReject = async (invite: Invite) => {
    try {
      await declineInvite(invite.id);
      if (invite.invitedBy) {
        sendNotificationToOtherUser(
          invite.invitedBy,
          'Invite Rejected',
          `${currentUser?.username} has rejected your invitation to join the board "${invite.boardName}"`,
        );
      }
    } catch (err) {
      console.error('Error rejecting invite:', err);
    }
  };

  const renderInvite = ({item}: {item: Invite}) => (
    <View style={styles.inviteCard}>
      <View style={styles.userRow}>
        <Image
          source={{
            uri: item?.invitedByUserInfo.photoURL,
          }}
          style={styles.avatar}
        />
        <View style={{marginLeft: 12}}>
          <Text style={styles.title}>
            {item.invitedByUserInfo?.username} invited you
          </Text>
          <Text style={styles.boardName}>Board: {item.boardName}</Text>
        </View>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAccept(item)}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item)}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={invites}
        keyExtractor={item => item.id}
        renderItem={renderInvite}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No invitations yet.</Text>
        }
      />
    </View>
  );
};

export default InviteScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 16},
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.black,
  },
  list: {paddingBottom: 20},
  inviteCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  title: {fontSize: 16, fontWeight: '600', color: Colors.black},
  boardName: {fontSize: 14, color: '#555', marginTop: 2},
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acceptButton: {backgroundColor: '#4CAF50'},
  rejectButton: {backgroundColor: '#F44336'},
  buttonText: {color: '#fff', fontWeight: '600'},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyText: {textAlign: 'center', color: '#999', marginTop: 40},
});
