import { API_CONFIG } from './config';

// Types for assignment data
export interface Assignment {
  id: string;
  name: string;
  description: string;
  due_at: string;
  points_possible: number;
  course_id: string;
  html_url: string;
  submission_types: string[];
  workflow_state: string;
}

export interface FetchAssignmentsData {
  apiKey: string;
  baseUrl: string;
  courseIds: string[];
  email: string;
  term: string; // Added term parameter
}

// API response types
export interface AssignmentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all assignments for given course IDs with term filter
 */
export const fetchAllAssignments = async (requestData: FetchAssignmentsData): Promise<AssignmentApiResponse<Assignment[]>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/assignments/db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data.assignments || data, // Handle different response formats
    };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fetch assignments for specific courses with term and error handling
 */
export const getAssignmentsByCourses = async (
  apiKey: string,
  baseUrl: string,
  courseIds: string[],
  email: string,
  term: string
): Promise<Assignment[]> => {
  try {
    const response = await fetchAllAssignments({
      apiKey,
      baseUrl,
      courseIds,
      email,
      term,
    });

    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'Failed to fetch assignments');
    }
  } catch (error) {
    console.error('Error in getAssignmentsByCourses:', error);
    throw error;
  }
};

/**
 * Extract course IDs from courses array
 */
export const extractCourseIds = (courses: { id: string }[]): string[] => {
  return courses.map(course => course.id);
};
