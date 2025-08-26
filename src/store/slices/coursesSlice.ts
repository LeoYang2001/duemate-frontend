import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Course {
  id: string;
  name: string;
  course_code: string;
  // Add more fields as needed based on Canvas API response
}

interface CoursesState {
  courses: Course[];
  currentCourseList: Course[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
}

const initialState: CoursesState = {
  courses: [],
  currentCourseList: [],
  isLoading: false,
  error: null,
  hasFetched: false,
};

// Async thunk for fetching courses
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async ({ apiKey, baseUrl }: { apiKey: string; baseUrl: string }) => {
    console.log('Fetching courses with:', { apiKey: apiKey.substring(0, 10) + '...', baseUrl });
    
    const response = await fetch(`http://localhost:3000/api/courses?apiKey=${apiKey}&baseUrl=${baseUrl}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const courses = await response.json();
    console.log('Courses:', courses);
    
    return courses;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCourses: (state) => {
      state.courses = [];
      state.currentCourseList = [];
      state.hasFetched = false;
      state.error = null;
    },
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
      state.hasFetched = true;
    },
    setCurrentCourseList: (state, action: PayloadAction<Course[]>) => {
      state.currentCourseList = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
        state.hasFetched = true;
        state.error = null;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch courses';
        console.error('Error fetching courses:', action.error);
      });
  },
});

export const { clearCourses, setCourses, setCurrentCourseList } = coursesSlice.actions;
export default coursesSlice.reducer;
