import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchAllAssignments, extractCourseIds, fetchMultipleAssignmentDetails } from '../../api/assignmentService';
import type { Assignment, DetailedAssignment } from '../../api/assignmentService';
import type { Course } from './coursesSlice';

// Combined assignment type that includes detailed information
interface CombinedAssignment extends Assignment {
  assignment_id: number;
  user_id: number;
  submission_type: string;
  submitted_at: string;
  score: number;
  grade: string;
  late: boolean;
  workflow_state: string;
  submission_comments: {
    comment: string;
    created_at: string;
  }[];
}

interface AssignmentsState {
  assignments: Assignment[];
  detailedAssignments: DetailedAssignment[];
  combinedAssignmentsList: CombinedAssignment[];
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
  hasFetched: boolean;
  hasDetailsFetched: boolean;
  lastFetchedTerm: string;
  lastFetchedCourseIds: string[];
}

const initialState: AssignmentsState = {
  assignments: [],
  detailedAssignments: [],
  combinedAssignmentsList: [],
  isLoading: false,
  isLoadingDetails: false,
  error: null,
  hasFetched: false,
  hasDetailsFetched: false,
  lastFetchedTerm: '',
  lastFetchedCourseIds: [],
};

// Utility function to fetch detail for a single assignment
const fetchDetail = (assignment: Assignment, detailedAssignments: DetailedAssignment[]): CombinedAssignment | null => {
  const detail = detailedAssignments.find(item => String(item.assignment_id) === String(assignment.id));
  if (detail) {
    return {
      ...assignment,
      ...detail
    };
  } else {
    return null;
  }
};

// Utility function to combine assignments with detailed assignments
const getCombinedAssignmentsList = (assignments: Assignment[], detailedAssignments: DetailedAssignment[]): CombinedAssignment[] => {
  return assignments.map(assignment => fetchDetail(assignment, detailedAssignments)).filter(Boolean) as CombinedAssignment[];
};

// Async thunk for fetching assignments with term parameter
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async ({ 
    apiKey, 
    baseUrl, 
    courses, 
    email,
    term
  }: { 
    apiKey: string; 
    baseUrl: string; 
    courses: Course[]; 
    email: string;
    term: string;
  }) => {
    const courseIds = extractCourseIds(courses);
    
    const response = await fetchAllAssignments({
      apiKey,
      baseUrl,
      courseIds,
      email,
      term,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch assignments');
    }

    return {
      assignments: response.data || [],
      courseIds,
      term,
    };
  }
);

// Async thunk for fetching detailed assignment information with progress
export const fetchAssignmentDetails = createAsyncThunk(
  'assignments/fetchAssignmentDetails',
  async ({ 
    apiKey, 
    baseUrl, 
    assignments,
    onProgress
  }: { 
    apiKey: string; 
    baseUrl: string; 
    assignments: Assignment[];
    onProgress?: (completed: number, total: number) => void;
  }) => {
    const detailedAssignments = await fetchMultipleAssignmentDetails(
      apiKey,
      baseUrl,
      assignments,
      onProgress
    );
    
    return detailedAssignments;
  }
);

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearAssignments: (state) => {
      state.assignments = [];
      state.detailedAssignments = [];
      state.combinedAssignmentsList = [];
      state.hasFetched = false;
      state.hasDetailsFetched = false;
      state.lastFetchedTerm = '';
      state.lastFetchedCourseIds = [];
      state.error = null;
    },
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
      state.hasFetched = true;
      // Automatically update combined list
      state.combinedAssignmentsList = getCombinedAssignmentsList(state.assignments, state.detailedAssignments);
    },
    clearDetailedAssignments: (state) => {
      state.detailedAssignments = [];
      state.hasDetailsFetched = false;
      // Update combined list since detailed assignments were cleared
      state.combinedAssignmentsList = getCombinedAssignmentsList(state.assignments, state.detailedAssignments);
    },
    // New action to manually update combined assignments list
    updateCombinedAssignmentsList: (state) => {
      state.combinedAssignmentsList = getCombinedAssignmentsList(state.assignments, state.detailedAssignments);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload.assignments;
        state.lastFetchedCourseIds = action.payload.courseIds;
        state.lastFetchedTerm = action.payload.term;
        state.hasFetched = true;
        state.error = null;
        // Automatically update combined list
        state.combinedAssignmentsList = getCombinedAssignmentsList(state.assignments, state.detailedAssignments);
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch assignments';
        console.error('Failed to fetch assignments:', action.error);
      })
      // Handle detailed assignment fetching
      .addCase(fetchAssignmentDetails.pending, (state) => {
        state.isLoadingDetails = true;
        state.error = null;
      })
      .addCase(fetchAssignmentDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.detailedAssignments = action.payload;
        state.hasDetailsFetched = true;
        state.error = null;
        // Automatically update combined list
        state.combinedAssignmentsList = getCombinedAssignmentsList(state.assignments, state.detailedAssignments);
      })
      .addCase(fetchAssignmentDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        state.error = action.error.message || 'Failed to fetch assignment details';
        console.error('Failed to fetch assignment details:', action.error);
      });
  },
});

export const { clearAssignments, setAssignments, clearDetailedAssignments, updateCombinedAssignmentsList } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;

// Export the CombinedAssignment type for use in components
export type { CombinedAssignment };
