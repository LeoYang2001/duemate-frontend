import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { filterCoursesBySemester } from '../../utils/courseUtils';

// Selector for current course list based on selected semester
export const selectCurrentCourseList = createSelector(
  [(state: RootState) => state.courses.courses, (state: RootState) => state.ui.selectedSemester],
  (courses, selectedSemester) => {
    return filterCoursesBySemester(courses, selectedSemester);
  }
);

// Selector for assignments state
export const selectAssignmentsState = (state: RootState) => state.assignments;

// Selector for current assignments (all assignments from the store)
export const selectCurrentAssignments = (state: RootState) => state.assignments.assignments;

// Selector for basic course state
export const selectCoursesState = (state: RootState) => state.courses;

// Selector for UI state
export const selectUiState = (state: RootState) => state.ui;

// Selector for auth state
export const selectAuthState = (state: RootState) => state.auth;
