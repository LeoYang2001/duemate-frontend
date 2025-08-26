import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fetchAllAssignments, extractCourseIds } from '../../api/assignmentService';
import type { Assignment } from '../../api/assignmentService';
import type { Course } from './coursesSlice';

interface AssignmentsState {
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchedTerm: string;
  lastFetchedCourseIds: string[];
}

const initialState: AssignmentsState = {
  assignments: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  lastFetchedTerm: '',
  lastFetchedCourseIds: [],
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

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearAssignments: (state) => {
      state.assignments = [];
      state.hasFetched = false;
      state.lastFetchedTerm = '';
      state.lastFetchedCourseIds = [];
      state.error = null;
    },
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
      state.hasFetched = true;
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
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch assignments';
        console.error('Failed to fetch assignments:', action.error);
      });
  },
});

export const { clearAssignments, setAssignments } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
