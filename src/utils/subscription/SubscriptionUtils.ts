import {userRef} from '@config/firebaseRN';
import {Timestamp} from '@react-native-firebase/firestore';
import {User} from '@utils/Constant';

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

export const hasActivePremiumSubscription = (user: User): boolean => {
  const subscription = user.subscription;

  if (!subscription) return false;

  let expiryDateStr: string | undefined;

  if (typeof subscription.expiryDate === 'string') {
    expiryDateStr = subscription.expiryDate;
  } else if (
    subscription.expiryDate &&
    typeof (subscription.expiryDate as Timestamp).toDate === 'function'
  ) {
    expiryDateStr = (subscription.expiryDate as Timestamp)
      .toDate()
      .toISOString();
  }

  const isExpired = isSubscriptionExpired(expiryDateStr);

  return subscription.isPremium === true && !isExpired;
};
