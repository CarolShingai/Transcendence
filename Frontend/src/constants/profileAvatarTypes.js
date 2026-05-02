/**
 * Profile Avatar Type Definition
 * 
 * This module defines the avatar selection system for user profiles.
 * Avatar indices follow this convention:
 * - 0: No avatar selected
 * - 1-15: Avatar images from the profile assets folder
 * 
 * The index directly maps to the avatar file:
 * index 1 → Profile_00.jpg
 * index 2 → Profile_01.jpg
 * etc.
 */

/**
 * Avatar configuration constants
 * @type {{NONE: number, MIN_INDEX: number, MAX_INDEX: number, TOTAL_AVATARS: number}}
 */
const AVATAR_CONFIG = {
  /** Represents "no avatar selected" state */
  NONE: 0,
  
  /** Minimum avatar index (excluding NONE) */
  MIN_INDEX: 1,
  
  /** Maximum avatar index */
  MAX_INDEX: 15,
  
  /** Total number of available avatars */
  TOTAL_AVATARS: 15,
};

/**
 * Validates if a value is a valid avatar index
 * @param {unknown} index - The value to validate
 * @returns {boolean} True if the index is valid (0-15)
 */
const isValidAvatarIndex = (index) => {
  const numIndex = Number(index);
  return (
    Number.isInteger(numIndex) &&
    numIndex >= AVATAR_CONFIG.NONE &&
    numIndex <= AVATAR_CONFIG.MAX_INDEX
  );
};

/**
 * Convert avatar index to asset filename
 * @param {number} index - Avatar index (0-15)
 * @returns {string} Filename or empty string if index is 0
 */
const getAvatarFilename = (index) => {
  if (index === AVATAR_CONFIG.NONE) {
    return '';
  }
  
  const fileIndex = index - 1;
  return `Profile_${String(fileIndex).padStart(2, '0')}.jpg`;
};

/**
 * Convert avatar index to asset import path
 * @param {number} index - Avatar index (0-15)
 * @returns {string} Asset path or empty string if index is 0
 */
const getAvatarAssetPath = (index) => {
  const filename = getAvatarFilename(index);
  return filename ? `../../assets/profile/${filename}` : '';
};

/**
 * Parse and validate avatar index from database response
 * @param {unknown} value - Raw value from database
 * @returns {number} Valid avatar index (0-15), defaults to 0 if invalid
 */
const parseAvatarIndexFromDatabase = (value) => {
  if (!isValidAvatarIndex(value)) {
    console.warn(
      `Invalid avatar index received: ${value}. Defaulting to NONE (0).`
    );
    return AVATAR_CONFIG.NONE;
  }
  return value;
};

export {
  AVATAR_CONFIG,
  isValidAvatarIndex,
  getAvatarFilename,
  getAvatarAssetPath,
  parseAvatarIndexFromDatabase,
};
