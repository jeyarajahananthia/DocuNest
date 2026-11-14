
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  hasLocalAccount,
  createLocalAccount,
  getLocalAccountByEmail,
  getLocalAccount,
} from '../database/database';

// ========================================
// CONFIGURATION
// ========================================

const SESSION_KEY = 'docunest_session';

const PBKDF2_ITERATIONS = 210000;
const HASH_LENGTH = 32;

// ========================================
// SESSION STORAGE
// ========================================

// Save login session
async function saveSession(session) {
  const value = JSON.stringify(session);

  if (Platform.OS === 'web') {
    localStorage.setItem(SESSION_KEY, value);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, value);
  }
}

// Retrieve login session
async function getSession() {
  try {
    let value;

    if (Platform.OS === 'web') {
      value = localStorage.getItem(SESSION_KEY);
    } else {
      value = await SecureStore.getItemAsync(SESSION_KEY);
    }

    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Session retrieval error:', error);
    return null;
  }
}

// Clear login session
export async function logout() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

// ========================================
// PASSWORD HASHING
// ========================================

async function hashPassword(password, salt) {
  const passwordBytes = new TextEncoder().encode(password);

  const saltBytes =
    typeof salt === 'string'
      ? hexToBytes(salt)
      : salt;

  const hash = pbkdf2(
    sha256,
    passwordBytes,
    saltBytes,
    {
      c: PBKDF2_ITERATIONS,
      dkLen: HASH_LENGTH,
    }
  );

  return bytesToHex(hash);
}

// Generate random salt
async function generateSalt() {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return bytesToHex(randomBytes);
}

// ========================================
// REGISTER USER
// ========================================

export async function registerUser(name, email, password) {
  const cleanName = name?.trim();
  const cleanEmail = email?.trim().toLowerCase();

  // Validate fields
  if (!cleanName || !cleanEmail || !password) {
    throw new Error('Please fill in all fields.');
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  // Validate password
  if (password.length < 8) {
    throw new Error('Password must contain at least 8 characters.');
  }

  // Check whether an account already exists
  if (await hasLocalAccount()) {
    throw new Error('A local account already exists.');
  }

  // Generate password salt
  const salt = await generateSalt();

  // Hash password
  const passwordHash = await hashPassword(password, salt);

  // Save account in local SQLite database
  await createLocalAccount(
    cleanName,
    cleanEmail,
    passwordHash,
    salt
  );

  // IMPORTANT:
  // Do not save a login session here.
  // The user must log in manually after registration.

  return {
    success: true,
    message: 'Account created successfully. Please log in.',
  };
}

// ========================================
// LOGIN USER
// ========================================

export async function loginUser(email, password) {
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw new Error('Please enter your email and password.');
  }

  // Find account using email
  const account = await getLocalAccountByEmail(cleanEmail);

  if (!account) {
    throw new Error('Invalid email or password.');
  }

  // Hash entered password using saved salt
  const enteredHash = await hashPassword(
    password,
    account.passwordSalt
  );

  // Compare password hashes
  if (enteredHash !== account.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  // Save session only after successful login
  await saveSession({
    userId: account.id,
    email: account.email,
    loggedInAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: 'Login successful.',
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
    },
  };
}

// ========================================
// CHECK AUTHENTICATION SESSION
// ========================================

export async function checkAuthSession() {
  const session = await getSession();

  if (!session || session.userId !== 1) {
    return {
      authenticated: false,
      user: null,
    };
  }

  // Verify that the account still exists
  const account = await getLocalAccount();

  if (!account || account.email !== session.email) {
    await logout();

    return {
      authenticated: false,
      user: null,
    };
  }

  return {
    authenticated: true,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
    },
  };
}

// ========================================
// CHECK ACCOUNT EXISTENCE
// ========================================

export async function isAccountRegistered() {
  return await hasLocalAccount();
}
