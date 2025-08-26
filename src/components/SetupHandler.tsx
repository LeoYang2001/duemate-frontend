import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSetupCompleted } from '../store/slices/authSlice';
import { setGlobalLoading } from '../store/slices/uiSlice';
import { clearCourses, fetchCourses } from '../store/slices/coursesSlice';
interface SetupHandlerProps {
  children: React.ReactNode;
}

export function SetupHandler({ children }: SetupHandlerProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isNewUser, hasCompletedSetup, schoolUrlKey } = useAppSelector(state => state.auth);
  const { isLoading: coursesLoading, hasFetched } = useAppSelector((state: any) => state.courses);

  useEffect(() => {
    // Run setup for any authenticated user who needs courses fetched
    if (isAuthenticated && user && schoolUrlKey) {
      console.log('Starting setup process for user...', { 
        isNewUser, 
        hasCompletedSetup, 
        hasFetched, 
        coursesLoading 
      });
      
      // Clear any existing courses and fetch fresh data for this session
      if (!hasFetched && !coursesLoading) {
        console.log('Clearing existing courses and fetching fresh data...');
        
        // Clear any existing course data
        dispatch(clearCourses());
        
        // Set global loading state
        dispatch(setGlobalLoading({ loading: true, message: 'Loading your courses...' }));
        
        dispatch(fetchCourses({ 
          apiKey: user.canvasApiKey, 
          baseUrl: schoolUrlKey 
        }))
        .unwrap()
        .then(() => {
          console.log('Course fetching completed successfully');
          // Mark setup as completed for this session
          dispatch(setSetupCompleted());
          dispatch(setGlobalLoading({ loading: false }));
        })
        .catch((error:any) => {
          console.error('Course fetching failed:', error);
          dispatch(setGlobalLoading({ loading: false }));
        });
      }
    }
  }, [isAuthenticated, user, schoolUrlKey, hasFetched, coursesLoading, dispatch]);

  return <>{children}</>;
}
