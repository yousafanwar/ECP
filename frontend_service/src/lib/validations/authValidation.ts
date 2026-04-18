import { VALIDATION_RULES } from "@/lib/constants/validationRules";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  /** Full E.164-style number, e.g. +12025550123 */
  phone: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

/** Strip spaces and common separators; keeps leading + and digits (for submit / validation). */
export const normalizeRegisterPhone = (raw: string): string => raw.trim().replace(/[\s\-().]/g, "");

/**
 * Formats as the user types: Pakistan +92 → "+92 3xx xxxxxxx" (3 + 7 national digits);
 * NANP +1 → "+1 XXX XXX XXXX"; otherwise "+XXX XXX …" in groups of three.
 */
export const formatPhoneAsYouType = (input: string): string => {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = input.replace(/\D/g, "");
  if (!digits && !hasPlus) return "";
  if (!digits && hasPlus) return "+";
  if (digits.length > 15) digits = digits.slice(0, 15);

  if (digits.startsWith("92")) {
    const national = digits.slice(2, 12);
    let out = "+92";
    const g1 = national.slice(0, 3);
    const g2 = national.slice(3, 10);
    if (g1) out += " " + g1;
    if (g2) out += " " + g2;
    return out;
  }

  if (digits.startsWith("1")) {
    const nanp = digits.slice(1, 11);
    let out = "+1";
    const a = nanp.slice(0, 3);
    const b = nanp.slice(3, 6);
    const c = nanp.slice(6, 10);
    if (a) out += " " + a;
    if (b) out += " " + b;
    if (c) out += " " + c;
    return out;
  }

  let out = "+";
  for (let i = 0; i < digits.length; i += 3) {
    out += (i > 0 ? " " : "") + digits.slice(i, i + 3);
  }
  return out;
};

export const validateRegisterForm = (data: RegisterFormData): string => {
  const { firstName, lastName, email, password, confirmPassword, phone } = data;

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

  const phoneNorm = normalizeRegisterPhone(phone);
  if (!phoneNorm) {
    return ERROR_MESSAGES.PHONE_REQUIRED;
  }
  if (!VALIDATION_RULES.PHONE_E164_REGEX.test(phoneNorm)) {
    return ERROR_MESSAGES.PHONE_INVALID;
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
