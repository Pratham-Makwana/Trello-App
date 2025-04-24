export const firebaseAuthErrorMessage = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'The email address is already registered. Please use a different email.';
    case 'auth/invalid-email':
      return 'The email address provided is invalid. Please enter a valid email.';
    case 'auth/weak-password':
      return 'The password is too weak. Please choose a stronger password.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support for assistance.';
    case 'auth/user-not-found':
      return 'Invalid login details. User not found.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please check your password and try again.';
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please enter a valid code.';
    case 'auth/invalid-verification-id':
      return 'Invalid verification ID. Please request a new verification code.';
    case 'auth/quota-exceeded':
      return 'Quota exceeded. Please try again later.';
    case 'auth/provider-already-linked':
      return 'The account is already linked with another provider.';
    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again.';
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different user account.';
    case 'auth/user-mismatch':
      return 'The supplied credentials do not match the current user.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email but different sign-in credentials.';
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed. Contact support for assistance.';
    case 'auth/expired-action-code':
      return 'The action code has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'The action code is invalid. Please check and try again.';
    case 'auth/missing-action-code':
      return 'The action code is missing. Please try again.';
    case 'auth/user-token-expired':
      return 'Your session has expired. Please sign in again.';
    case 'auth/invalid-credential':
      return 'The credential is malformed or has expired.';
    case 'auth/user-token-revoked':
      return 'Session revoked. Please log in again.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    case 'auth/app-not-authorized':
      return 'This app is not authorized for Firebase Authentication.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/invalid-login-credentials':
    case 'INVALID_LOGIN_CREDENTIALS':
      return 'Invalid login credentials. Please try again.';
    default:
      return 'An unexpected authentication error occurred. Please try again.';
  }
};
