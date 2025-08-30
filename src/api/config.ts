// API configuration
export const API_CONFIG = {
  BASE_URL: 'https://duemate-backend-production.up.railway.app',
  ENDPOINTS: {
    USERS: '/api/users',
    USER_BY_EMAIL: (email: string) => `/api/users/email/${email}`,
    ASSIGNMENTS: '/api/assignments/db',
    ASSIGNMENT_DETAIL: '/api/assignments/detail',
  },
} as const;

export default API_CONFIG;
