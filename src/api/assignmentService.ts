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

// Types for detailed assignment data
export interface DetailedAssignment {
  assignment_id: number;
  user_id: number;
  submission_type: string;
  submitted_at: string;
  score: number;
  grade: string;
  late: boolean;
  missing: boolean;
  workflow_state: string;
  submission_comments: {
    comment: string;
    created_at: string;
  }[];
}

export interface FetchAssignmentsData {
  apiKey: string;
  baseUrl: string;
  courseIds: string[];
  email: string;
  term: string; // Added term parameter
}

export interface FetchAssignmentDetailData {
  apiKey: string;
  baseUrl: string;
  courseId: string;
  assignmentId: string;
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

/**
 * Fetch detailed assignment information for a specific assignment
 */
export const fetchAssignmentDetail = async (requestData: FetchAssignmentDetailData): Promise<AssignmentApiResponse<DetailedAssignment>> => {
  try {
    const { apiKey, baseUrl, courseId, assignmentId } = requestData;
    const url = `${API_CONFIG.BASE_URL}/api/assignments/detail?apiKey=${apiKey}&baseUrl=${encodeURIComponent(baseUrl)}&courseId=${courseId}&assignmentId=${assignmentId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
      data: data,
    };
  } catch (error) {
    console.error('Error fetching assignment detail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Fetch detailed information for multiple assignments with progress tracking
 */
export const fetchMultipleAssignmentDetails = async (
  apiKey: string,
  baseUrl: string,
  assignments: Assignment[],
  onProgress?: (completed: number, total: number) => void
): Promise<DetailedAssignment[]> => {
  const detailedAssignments: DetailedAssignment[] = [];
  const totalAssignments = assignments.length;
  let completedAssignments = 0;
  
  // Process assignments in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize);
    
    const batchPromises = batch.map(assignment => 
      fetchAssignmentDetail({
        apiKey,
        baseUrl,
        courseId: assignment.course_id,
        assignmentId: assignment.id,
      })
    );
    
    try {
      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.success && result.data) {
          detailedAssignments.push(result.data);
        } else {
          console.warn(`Failed to fetch details for assignment ${batch[index].id}:`, result.error);
        }
        
        // Update progress for each completed assignment
        completedAssignments++;
        if (onProgress) {
          onProgress(completedAssignments, totalAssignments);
        }
      });
      
      // Small delay between batches to be nice to the server
      if (i + batchSize < assignments.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error processing batch:', error);
    }
  }
  
  return detailedAssignments;
};
