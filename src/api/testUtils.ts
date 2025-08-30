import { createUser, getUserByEmail } from './userApi';
import { authenticateUser, logout } from './authService';

// Test functions for API (for development/debugging)
export const testAPI = {
  // Clear all localStorage (useful for testing)
  clearStorage: () => {
    console.log('Clearing localStorage...');
    logout();
    console.log('localStorage cleared');
  },

  // Check current localStorage
  checkStorage: () => {
    console.log('Current localStorage:');
    console.log('isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('userData:', localStorage.getItem('userData'));
    console.log('schoolUrlKey:', localStorage.getItem('schoolUrlKey'));
  },

  // Test Redux setup process
  testNewUserSetup: () => {
    console.log('Testing new user setup process...');
    // This will trigger the setup process when you login with a new user
    console.log('1. Clear existing localStorage');
    logout();
    console.log('2. Go to onboarding page and create a new user');
    console.log('3. The setup process should automatically fetch courses');
    console.log('4. Check browser console for course fetch logs');
  },

  // Test course fetching manually
  testCourseFetch: async () => {
    const apiKey = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')!).canvasApiKey : 'test-key';
    const baseUrl = localStorage.getItem('schoolUrlKey') || 'https://uk.instructure.com/api/v1';
    
    console.log('Testing course fetch with:', { apiKey: apiKey.substring(0, 10) + '...', baseUrl });
    
    try {
      const response = await fetch(`https://duemate-backend-production.up.railway.app/api/courses?apiKey=${apiKey}&baseUrl=${baseUrl}`);
      const courses = await response.json();
      console.log('Courses:', courses);
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return null;
    }
  },
  // Test creating a user
  testCreateUser: async () => {
    const testUserData = {
      email: 'test@example.com',
      canvasApiKey: 'test-api-key',
      school: 'https://uk.instructure.com/api/v1', // Now using URL key
      fullName: 'Test User',
      scheduleIds: [],
    };
    
    console.log('Testing createUser...');
    const result = await createUser(testUserData);
    console.log('Create user result:', result);
    return result;
  },

  // Test getting a user by email
  testGetUser: async (email: string = 'test@example.com') => {
    console.log(`Testing getUserByEmail for: ${email}`);
    const result = await getUserByEmail(email);
    console.log('Get user result:', result);
    return result;
  },

  // Test authentication flow
  testAuth: async () => {
    const testUserData = {
      email: 'auth-test@example.com',
      canvasApiKey: 'auth-test-key',
      school: 'https://stanford.instructure.com/api/v1', // Now using URL key
      fullName: 'Auth Test User',
      scheduleIds: [],
    };
    
    console.log('Testing authentication...');
    const result = await authenticateUser(testUserData);
    console.log('Auth result:', result);
    return result;
  },
};

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testAPI = testAPI;
}
