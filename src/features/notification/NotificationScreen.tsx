import React from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useAppSelector} from '@store/reduxHook';
import firestore from '@react-native-firebase/firestore';
import {useUser} from '@hooks/useUser';
import {Colors} from '@utils/Constant';
import {clearAllNotifications} from '@config/firebaseNotification';

const NotificationScreen = () => {
  const notifications = useAppSelector(
    state => state.notification.notifications,
  );
  const {user} = useUser();

  const handleMarkAllRead = () => {
    firestore()
      .collection('notifications')
      .where('userId', '==', user?.uid)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({read: true});
        });
      })
      .catch(error => {
        console.log('Error updating notifications in Firestore:', error);
      });
  };

  const handleClearAll = async () => {
    if (user?.uid) {
      await clearAllNotifications(user?.uid);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: {
      id: string;
      title: string;
      body: string;
      read: boolean;
      createdAt: any;
    };
  }) => (
    <View
      style={[
        styles.notificationItem,
        item.read ? styles.readNotification : styles.unreadNotification,
      ]}>
      <Text style={[styles.title, item.read && styles.readTitle]}>
        {item.title}
      </Text>
      <Text style={[styles.body, item.read && styles.readBody]}>
        {item.body}
      </Text>
      <Text style={[styles.body, item.read && styles.readBody]}>
        {new Date(item.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {notifications.length > 0 && (
          <>
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text style={styles.clearButton}>Mark all read</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet.</Text>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    color: '#007BFF',
    fontSize: 14,
  },
  notificationItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#FFF3E5',
    borderColor: '#FFB74D',
    borderWidth: 1.5,
  },
  readNotification: {
    backgroundColor: '#E5F5FF',
    borderColor: '#4DB6FF',
    borderWidth: 1,
    opacity: 0.9,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: Colors.fontDark,
  },
  body: {
    color: '#666',
    fontSize: 14,
  },
  readTitle: {
    color: Colors.darkprimary,
  },
  readBody: {
    color: Colors.darkprimary,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});
