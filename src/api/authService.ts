import { createUser, getUserByEmail } from './userApi';
import type { CreateUserData, User } from './userApi';

// Local storage keys
const STORAGE_KEYS = {
  IS_AUTHENTICATED: 'isAuthenticated',
  USER_DATA: 'userData',
  SELECTED_SEMESTER: 'selectedSemester',
  SCHOOL_URL_KEY: 'schoolUrlKey',
} as const;

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isNewUser?: boolean;
}

/**
 * Authenticate user - either login existing user or create new user
 */
export const authenticateUser = async (userData: CreateUserData): Promise<AuthResult> => {
  try {
    // First, try to get existing user by email
    const existingUserResponse = await getUserByEmail(userData.email);
    
    if (existingUserResponse.success && existingUserResponse.data) {
      // User exists, save to localStorage and return
      const user = existingUserResponse.data;
      saveUserToLocalStorage(user);
      
      return {
        success: true,
        user: user,
        isNewUser: false,
      };
    }
    
    // User doesn't exist, create new user
    const newUserResponse = await createUser(userData);
    
    if (newUserResponse.success && newUserResponse.data) {
      const user = newUserResponse.data;
      saveUserToLocalStorage(user);
      
      return {
        success: true,
        user: user,
        isNewUser: true,
      };
    }
    
    return {
      success: false,
      error: newUserResponse.error || 'Failed to create user',
    };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserToLocalStorage = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  // Also save school URL key separately for easy access
  localStorage.setItem(STORAGE_KEYS.SCHOOL_URL_KEY, user.school);
};

/**
 * Get user data from localStorage
 */
export const getUserFromLocalStorage = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const authStatus = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
  const userData = getUserFromLocalStorage();
  return authStatus === 'true' && userData !== null;
};

/**
 * Logout user - clear all localStorage data
 */
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.SELECTED_SEMESTER);
  localStorage.removeItem(STORAGE_KEYS.SCHOOL_URL_KEY);
};

/**
 * Get current user data (from localStorage)
 */
export const getCurrentUser = (): User | null => {
  if (!isAuthenticated()) {
    return null;
  }
  return getUserFromLocalStorage();
};

/**
 * Update user data in localStorage
 */
export const updateUserInLocalStorage = (updates: Partial<User>): void => {
  const currentUser = getUserFromLocalStorage();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    saveUserToLocalStorage(updatedUser);
  }
};

/**
 * Get school URL key from localStorage
 */
export const getSchoolUrlKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.SCHOOL_URL_KEY);
};
