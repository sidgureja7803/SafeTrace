import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES encryption
 * @param {string} text - The plain text to encrypt
 * @param {string} key - The encryption key (user-specific)
 * @returns {string} - The encrypted text
 */
export const encrypt = (text, key) => {
  if (!text) return '';
  
  try {
    // Use the provided key or default to env var
    const encryptionKey = key || process.env.REACT_APP_ENCRYPTION_KEY || 'default-encryption-key';
    
    // Encrypt the text
    const encryptedText = CryptoJS.AES.encrypt(text, encryptionKey).toString();
    return encryptedText;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - The encrypted text
 * @param {string} key - The encryption key (user-specific)
 * @returns {string} - The decrypted plain text
 */
export const decrypt = (encryptedText, key) => {
  if (!encryptedText) return '';
  
  try {
    // Use the provided key or default to env var
    const encryptionKey = key || process.env.REACT_APP_ENCRYPTION_KEY || 'default-encryption-key';
    
    // Decrypt the text
    const bytes = CryptoJS.AES.decrypt(encryptedText, encryptionKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

/**
 * Checks if a password meets security requirements
 * @param {string} password - The password to check
 * @returns {Object} - Object containing result and reasons
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return { 
      isStrong: false, 
      score: 0,
      reasons: ['Password is empty'] 
    };
  }

  const reasons = [];
  let score = 0;

  // Check length
  if (password.length < 8) {
    reasons.push('Password should be at least 8 characters long');
  } else {
    score += 1;
  }

  // Check uppercase
  if (!/[A-Z]/.test(password)) {
    reasons.push('Password should contain at least one uppercase letter');
  } else {
    score += 1;
  }

  // Check lowercase
  if (!/[a-z]/.test(password)) {
    reasons.push('Password should contain at least one lowercase letter');
  } else {
    score += 1;
  }

  // Check numbers
  if (!/[0-9]/.test(password)) {
    reasons.push('Password should contain at least one number');
  } else {
    score += 1;
  }

  // Check special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    reasons.push('Password should contain at least one special character');
  } else {
    score += 1;
  }

  // Check common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'welcome'];
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    reasons.push('Password contains common patterns that are easy to guess');
    score -= 1;
  }

  // Calculate final strength
  const isStrong = score >= 4 && password.length >= 10;

  return {
    isStrong,
    score: Math.max(0, score),
    reasons: reasons.length > 0 ? reasons : ['Password is strong']
  };
};

/**
 * Generates a secure random password
 * @param {number} length - The length of the password
 * @returns {string} - The generated password
 */
export const generateSecurePassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure we have at least one of each character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 25)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password
  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  
  return password;
}; 