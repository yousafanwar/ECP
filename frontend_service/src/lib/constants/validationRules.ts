// Regex patterns and validation rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  FIRST_NAME_MIN_LENGTH: 2,
  LAST_NAME_MIN_LENGTH: 2,
};

export const FIELD_LABELS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  password: "Password",
  confirmPassword: "Confirm password",
};
