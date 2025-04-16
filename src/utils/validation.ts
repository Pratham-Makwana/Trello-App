interface Form {
  username?: string;
  email?: string;
  password?: string;
}

export const validateForm = (form: Form, isSignup = true) => {
  const errors = {
    usernameError: '',
    emailError: '',
    passwordError: '',
  };

  // Validate Username (only for Signup)
  if (isSignup && !form.username) {
    errors.usernameError = 'Username is required';
  }

  // Validate Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!form.email) {
    errors.emailError = 'Email is required';
  } else if (!emailRegex.test(form.email)) {
    errors.emailError = 'Please enter a valid email address.';
  }

  // Validate Password (only for Signup)
  if (!form.password) {
    errors.passwordError = 'Password is required';
  } else if (form.password && form.password.length < 8) {
    errors.passwordError = 'Password must be at least 8 characters long';
  }

  // Additional Password strength check (for Signup)
  if (
    form.password &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      form.password,
    )
  ) {
    errors.passwordError =
      'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.';
  }

  return errors;
};
