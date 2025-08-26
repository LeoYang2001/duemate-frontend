import { API_CONFIG } from './config';

// Types for user data
export interface CreateUserData {
  email: string;
  canvasApiKey: string;
  school: string;
  fullName: string;
  scheduleIds?: string[];
}

export interface User {
  id?: string;
  email: string;
  canvasApiKey: string;
  school: string;
  fullName: string;
  scheduleIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserData): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        scheduleIds: userData.scheduleIds || [],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<ApiResponse<User>> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_EMAIL(email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 404) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
