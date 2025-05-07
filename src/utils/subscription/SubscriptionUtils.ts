import {userRef} from '@config/firebaseRN';
import {Timestamp} from '@react-native-firebase/firestore';

export const formatSubscriptionType = (type: string) => {
  if (!type) return '';

  return type
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\s+/, '')
    .split(' ')
    .map(
      (word: string) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ');
};
export const isSubscriptionExpired = (
  expiryDateStr?: string | Timestamp,
): boolean => {
  if (!expiryDateStr) return true;

  const expiryDate =
    expiryDateStr instanceof Timestamp
      ? expiryDateStr.toDate()
      : new Date(expiryDateStr);
  const today = new Date();

  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return expiryDate <= today;
};

export const getRemainingDays = (expiryDateStr: string | Timestamp) => {
  if (!expiryDateStr) return 0;

  const expiryDate =
    expiryDateStr instanceof Timestamp
      ? expiryDateStr.toDate()
      : new Date(expiryDateStr);
  const today = new Date();
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const timeDiff = expiryDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff > 0 ? daysDiff : 0;
};

export const updateIsPremiumStatus = async (userId: string) => {
  await userRef.doc(userId).update({
    'subscription.isPremium': false,
  });
};
