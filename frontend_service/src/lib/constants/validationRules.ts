// Regex patterns and validation rules
/** E.164-style: + then 10–15 digits, first digit after + is 1–9 (fits DB VARCHAR(20)). */
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Full international number including country code (e.g. +12025550123). */
  PHONE_E164_REGEX: /^\+[1-9]\d{9,14}$/,
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
