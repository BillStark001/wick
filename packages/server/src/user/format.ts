import * as crypto from 'crypto';
import { AppConfig } from '@/config.service'; // Assuming config.ts exports AppConfig

// Regular expression patterns
const patternUsername: RegExp = /^[a-zA-Z0-9_]{8,32}$/;
const patternPassword: RegExp = /^[\x20-\x7E]{6,128}$/;
const patternEmail: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Check if a username is valid.
 *
 * @param username The input username to validate.
 * @returns True if the username is valid, False otherwise.
 *
 * Valid username requirements:
 * - Must consist of alphanumeric characters (a-z, A-Z, 0-9) and underscores (_).
 * - Must be between 8 and 32 characters in length.
 */
function isValidUsername(username: string): boolean {
  return patternUsername.test(username);
}

/**
 * Check if a password is valid.
 *
 * @param password The input password to validate.
 * @returns True if the password is valid, False otherwise.
 *
 * Valid password requirements:
 * - Must consist of printable ASCII characters (ASCII range 0x20 to 0x7E).
 * - Must be between 6 and 128 characters in length.
 */
function isValidPassword(password: string): boolean {
  return patternPassword.test(password);
}

/**
 * Check if an email address is valid.
 *
 * @param email The input email address to validate.
 * @returns True if the email address is valid, False otherwise.
 *
 * Valid email address requirements:
 * - Must follow a standard email format, e.g., "user@example.com".
 * - User part may consist of alphanumeric characters, dots (.), underscores (_),
 *   percent signs (%), and plus signs (+).
 * - Domain part must consist of alphanumeric characters, dots (.), and hyphens (-).
 * - Must have a valid top-level domain (TLD) with at least 2 characters.
 */
function isValidEmail(email: string): boolean {
  return patternEmail.test(email);
}

/**
 * Encode a password using HMAC with SHA-256.
 *
 * @param password The input password to encode.
 * @returns The encoded password as a hexadecimal string.
 */
function encodePassword(password: string): string {
  return crypto.createHmac('sha256', AppConfig.HmacSalt)
    .update(password)
    .digest('hex');
}

/**
 * Verify if the provided password matches the encoded password.
 *
 * @param password The input password to verify.
 * @param encoded The encoded password to compare against.
 * @returns True if the password matches the encoded password, False otherwise.
 */
function verifyPassword(password: string, encoded: string): boolean {
  const newEncoded = encodePassword(password);
  return newEncoded === encoded;
}

export {
  isValidUsername,
  isValidPassword,
  isValidEmail,
  encodePassword,
  verifyPassword
};