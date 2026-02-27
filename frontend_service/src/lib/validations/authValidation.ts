import { VALIDATION_RULES, FIELD_LABELS } from "@/lib/constants/validationRules";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

export const validateRegisterForm = (data: RegisterFormData): string => {
  const { firstName, lastName, email, password, confirmPassword } = data;

  // First Name validation
  if (!firstName.trim()) {
    return ERROR_MESSAGES.FIRST_NAME_REQUIRED;
  }
  if (firstName.trim().length < VALIDATION_RULES.FIRST_NAME_MIN_LENGTH) {
    return ERROR_MESSAGES.FIRST_NAME_TOO_SHORT;
  }

  // Last Name validation
  if (!lastName.trim()) {
    return ERROR_MESSAGES.LAST_NAME_REQUIRED;
  }
  if (lastName.trim().length < VALIDATION_RULES.LAST_NAME_MIN_LENGTH) {
    return ERROR_MESSAGES.LAST_NAME_TOO_SHORT;
  }

  // Email validation
  if (!email.trim()) {
    return ERROR_MESSAGES.EMAIL_REQUIRED;
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID;
  }

  // Password validation
  if (!password) {
    return ERROR_MESSAGES.PASSWORD_REQUIRED;
  }
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }

  // Confirm Password validation
  if (!confirmPassword) {
    return ERROR_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  }
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_NOT_MATCH;
  }

  return ""; // No errors
};

export const validateLoginForm = (data: LoginFormData): string => {
  const { email, password } = data;

  if (!email.trim()) {
    return ERROR_MESSAGES.EMAIL_REQUIRED;
  }
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID;
  }
  if (!password) {
    return ERROR_MESSAGES.PASSWORD_REQUIRED;
  }

  return ""; // No errors
};
