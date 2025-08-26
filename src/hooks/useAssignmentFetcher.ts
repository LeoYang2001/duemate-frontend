import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAssignments, clearAssignments } from '../store/slices/assignmentsSlice';
import { selectCurrentCourseList } from '../store/selectors';
import { setGlobalLoading } from '../store/slices/uiSlice';

/**
 * Hook to automatically fetch assignments when semester or courses change
 */
export const useAssignmentFetcher = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, schoolUrlKey } = useAppSelector(state => state.auth);
  const { selectedSemester } = useAppSelector(state => state.ui);
  const currentCourseList = useAppSelector(selectCurrentCourseList);
  const { isLoading: assignmentsLoading, lastFetchedTerm, hasFetched } = useAppSelector(state => state.assignments);
  const { hasFetched: coursesHasFetched } = useAppSelector(state => state.courses);

  useEffect(() => {
    // Only fetch assignments if:
    // 1. User is authenticated
    // 2. We have user data and school URL
    // 3. Courses have been fetched
    // 4. We have a selected semester
    // 5. We have courses for this semester
    // 6. We haven't fetched for this term yet OR it's a different term
    // 7. Not currently loading
    if (
      isAuthenticated &&
      user &&
      schoolUrlKey &&
      coursesHasFetched &&
      selectedSemester &&
      currentCourseList.length > 0 &&
      (lastFetchedTerm !== selectedSemester || !hasFetched) &&
      !assignmentsLoading
    ) {
      console.log('Fetching assignments for semester:', selectedSemester);
      console.log('Course count:', currentCourseList.length);
      
      // Clear previous assignments if switching terms
      if (lastFetchedTerm && lastFetchedTerm !== selectedSemester) {
        dispatch(clearAssignments());
      }
      
      // Set loading state
      dispatch(setGlobalLoading({ 
        loading: true, 
        message: `Loading assignments for ${selectedSemester}...` 
      }));

      // Fetch assignments for current courses and semester
      dispatch(fetchAssignments({
        apiKey: user.canvasApiKey,
        baseUrl: schoolUrlKey,
        courses: currentCourseList,
        email: user.email,
        term: selectedSemester,
      }))
      .unwrap()
      .then(() => {
        console.log('Assignment fetching completed for', selectedSemester);
        dispatch(setGlobalLoading({ loading: false }));
      })
      .catch((error: any) => {
        console.error('Assignment fetching failed:', error);
        dispatch(setGlobalLoading({ loading: false }));
      });
    }
  }, [
    isAuthenticated,
    user,
    schoolUrlKey,
    coursesHasFetched,
    selectedSemester,
    currentCourseList,
    lastFetchedTerm,
    hasFetched,
    assignmentsLoading,
    dispatch
  ]);
};
